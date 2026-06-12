#!/usr/bin/env bash
# ============================================================
# deploy.sh — Script de déploiement complet sur EKS
# ============================================================
# Usage :
#   chmod +x deploy.sh
#   ./deploy.sh           → deploy complet (infra + images + k8s)
#   ./deploy.sh --infra   → Terraform uniquement
#   ./deploy.sh --app     → Images Docker + manifests k8s uniquement
#   ./deploy.sh --destroy → Détruire toute l'infrastructure
# ============================================================

set -euo pipefail

# ── Couleurs ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[+]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $*"; }

# ── Variables ──────────────────────────────────────────────────────────────────
REGION="us-west-2"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${PROJECT_DIR}/../.."
K8S_DIR="${PROJECT_DIR}/k8s"
IMAGE_TAG="${IMAGE_TAG:-latest}"

# ── Vérification des prérequis ────────────────────────────────────────────────
check_prerequisites() {
  log "Vérification des prérequis..."
  for cmd in terraform aws docker kubectl; do
    command -v "$cmd" &>/dev/null || err "Outil manquant : $cmd"
  done
  aws sts get-caller-identity &>/dev/null || err "AWS CLI non configuré (aws configure)"
  log "Prérequis OK ✓"
}

# ── Phase 1 : Terraform ────────────────────────────────────────────────────────
deploy_infrastructure() {
  log "=== Phase 1 : Déploiement de l'infrastructure Terraform ==="
  cd "$PROJECT_DIR"

  terraform init
  terraform validate

  info "Plan Terraform :"
  terraform plan -out=tfplan

  echo ""
  warn "Voulez-vous appliquer ce plan ? (yes/no)"
  read -r CONFIRM
  [[ "$CONFIRM" == "yes" ]] || err "Annulé par l'utilisateur."

  terraform apply tfplan
  log "Infrastructure créée ✓"

  # Récupérer les outputs
  CLUSTER_NAME=$(terraform output -raw cluster_name)
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  ECR_BACKEND=$(terraform output -raw ecr_backend_url)
  ECR_FRONTEND=$(terraform output -raw ecr_frontend_url)

  export CLUSTER_NAME ACCOUNT_ID ECR_BACKEND ECR_FRONTEND
}

# ── Charger les variables depuis l'infra existante ────────────────────────────
load_infra_variables() {
  log "Récupération des variables d'infrastructure..."
  cd "$PROJECT_DIR"
  CLUSTER_NAME=$(terraform output -raw cluster_name)
  ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
  ECR_BACKEND=$(terraform output -raw ecr_backend_url)
  ECR_FRONTEND=$(terraform output -raw ecr_frontend_url)
  export CLUSTER_NAME ACCOUNT_ID ECR_BACKEND ECR_FRONTEND
}

# ── Phase 2 : Build & Push Docker → ECR ──────────────────────────────────────
build_and_push_images() {
  log "=== Phase 2 : Build & Push des images Docker ==="

  # Login ECR
  log "Login ECR..."
  aws ecr get-login-password --region "$REGION" \
    | docker login --username AWS --password-stdin \
      "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

  # Backend
  log "Build backend..."
  docker build -t "portfolio-backend:${IMAGE_TAG}" "${REPO_ROOT}/Backend"
  docker tag "portfolio-backend:${IMAGE_TAG}" "${ECR_BACKEND}:${IMAGE_TAG}"
  docker push "${ECR_BACKEND}:${IMAGE_TAG}"
  log "Backend poussé → ${ECR_BACKEND}:${IMAGE_TAG} ✓"

  # Frontend
  log "Build frontend..."
  docker build -t "portfolio-frontend:${IMAGE_TAG}" "${REPO_ROOT}/Frontend"
  docker tag "portfolio-frontend:${IMAGE_TAG}" "${ECR_FRONTEND}:${IMAGE_TAG}"
  docker push "${ECR_FRONTEND}:${IMAGE_TAG}"
  log "Frontend poussé → ${ECR_FRONTEND}:${IMAGE_TAG} ✓"
}

# ── Phase 3 : Déploiement Kubernetes via Terraform ────────────────────────────
deploy_kubernetes() {
  log "=== Phase 3 : Déploiement des manifests Kubernetes via Terraform ==="

  # Configurer kubectl pour le cluster EKS
  aws eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME"

  # Déployer avec le module terraform-k8s-deploy en pointant vers les images ECR
  K8S_TF_DIR="${REPO_ROOT}/Terraform/terraform-k8s-deploy"
  cd "$K8S_TF_DIR"

  terraform init -input=false

  terraform apply -auto-approve \
    -var="kube_context=$(kubectl config current-context)" \
    -var="docker_hub_user=${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com" \
    -var="backend_image_name=portfolio-backend" \
    -var="frontend_image_name=portfolio-frontend" \
    -var="image_tag=${IMAGE_TAG}" \
    -var="frontend_service_type=LoadBalancer" \
    -var="cors_origin=*"

  log "Déploiement Kubernetes terminé ✓"

  # Attendre que les pods soient prêts
  kubectl rollout status deployment/backend-deployment  -n portfolio --timeout=180s
  kubectl rollout status deployment/frontend-deployment -n portfolio --timeout=180s

  # Afficher l'URL publique
  echo ""
  info "=== URL de l'application ==="
  echo "En attente de l'IP du LoadBalancer..."
  for i in {1..12}; do
    LB_URL=$(kubectl get svc frontend-service -n portfolio \
      -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)
    [[ -n "$LB_URL" ]] && break
    sleep 10
  done
  [[ -n "${LB_URL:-}" ]] \
    && log "Application disponible sur : http://${LB_URL}" \
    || warn "LoadBalancer en cours de provisionnement. Exécuter : kubectl get svc -n portfolio"
}
# ── Destroy ────────────────────────────────────────────────────────────────────
destroy_infrastructure() {
  warn "⚠  ATTENTION : Cette action va SUPPRIMER toute l'infrastructure !"
  warn "Cela inclut le cluster EKS, les images ECR, le VPC et les données MongoDB."
  echo ""
  warn "Tapez 'DESTROY' pour confirmer :"
  read -r CONFIRM
  [[ "$CONFIRM" == "DESTROY" ]] || err "Annulé."

  # Supprimer les ressources Kubernetes d'abord (pour libérer les LoadBalancers)
  if kubectl config current-context &>/dev/null 2>&1; then
    kubectl delete namespace portfolio --ignore-not-found=true || true
    sleep 15
  fi

  cd "$PROJECT_DIR"
  terraform destroy -auto-approve
  log "Infrastructure détruite."
}

# ── Main ───────────────────────────────────────────────────────────────────────
main() {
  check_prerequisites

  case "${1:-all}" in
    --infra)   deploy_infrastructure ;;
    --app)
      load_infra_variables
      build_and_push_images
      deploy_kubernetes
      ;;
    --destroy) destroy_infrastructure ;;
    all|"")
      deploy_infrastructure
      build_and_push_images
      deploy_kubernetes
      ;;
    *) err "Usage : $0 [--infra | --app | --destroy]" ;;
  esac
}

main "$@"
