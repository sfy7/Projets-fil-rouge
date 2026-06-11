# ══════════════════════════════════════════════════════════════════════
# Déploiement sur Kubernetes avec Terraform
# ══════════════════════════════════════════════════════════════════════
#
# Ce code remplace les commandes kubectl manuelles :
#   kubectl apply -f .etc
#
# Maintenant c'est juste : terraform apply  ✅
#
# Architecture des modules :
#
#   main.tf  (ici)
#     ├── module "namespace"     → crée le namespace "portfolio"
#     ├── module "configmap"     → ConfigMap + Secret
#     ├── module "deployments"   → MongoDB, Backend, Frontend
#     └── module "services"      → Services ClusterIP, Headless, NodePort
#
# Prérequis :
#   - Minikube lancé : minikube start
#   - Terraform installé
# ══════════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.3"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
  }
}

# ──────────────────────────────────────────────────────────────────────
# PROVIDER KUBERNETES
# Terraform se connecte au cluster Kubernetes
# ──────────────────────────────────────────────────────────────────────
provider "kubernetes" {
  # Lit la configuration depuis ~/.kube/config (généré par minikube start)
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}

# ──────────────────────────────────────────────────────────────────────
# MODULE 1 : Namespace
# Crée le namespace "portfolio" qui isole toutes les ressources
# ──────────────────────────────────────────────────────────────────────
module "namespace" {
  source = "./modules/namespace"

  namespace = var.namespace
}

# ──────────────────────────────────────────────────────────────────────
# MODULE 2 : ConfigMap & Secret
# Injecte les variables d'environnement dans les pods
# ──────────────────────────────────────────────────────────────────────
module "configmap" {
  source = "./modules/configmap"

  namespace      = var.namespace
  node_env       = var.node_env
  port           = var.app_port
  mongo_uri      = var.mongo_uri
  cors_origin    = var.cors_origin
  mongo_password = var.mongo_root_password

  # Ce module dépend du namespace — il doit exister d'abord
  depends_on = [module.namespace]
}

# ──────────────────────────────────────────────────────────────────────
# MODULE 3 : Services
# Expose les déploiements pour qu'ils communiquent entre eux
# et soient accessibles depuis l'extérieur
# ──────────────────────────────────────────────────────────────────────
module "services" {
  source = "./modules/services"

  namespace             = var.namespace
  nodeport              = var.frontend_nodeport
  frontend_service_type = var.frontend_service_type

  depends_on = [module.namespace]
}


# ──────────────────────────────────────────────────────────────────────
# MODULE 4 : MongoDB
# ──────────────────────────────────────────────────────────────────────
module "mongodb" {
  source     = "./modules/mongodb"
  namespace  = var.namespace
  depends_on = [module.services]
}

# ──────────────────────────────────────────────────────────────────────
# MODULE 5 : Deployments
# Déploie Backend et Frontend
# ──────────────────────────────────────────────────────────────────────
module "deployments" {
  source = "./modules/deployments"

  namespace         = var.namespace
  backend_image     = "${var.docker_hub_user}/${var.backend_image_name}:${var.image_tag}"
  frontend_image    = "${var.docker_hub_user}/${var.frontend_image_name}:${var.image_tag}"
  backend_replicas  = var.backend_replicas
  frontend_replicas = var.frontend_replicas
  configmap_name    = module.configmap.configmap_name

  # Le ConfigMap doit exister avant les déploiements
  depends_on = [module.mongodb, module.configmap]
}


