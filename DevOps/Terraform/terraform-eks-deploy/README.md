# 🚀 Déploiement Portfolio sur AWS EKS avec Terraform

Ce module déploie l'application Portfolio (React + Express + MongoDB) sur un cluster Kubernetes managé AWS EKS.

---

## Architecture déployée

```
Internet
    │
    ▼
[ALB / LoadBalancer]
    │
    ├──▶ frontend-service (nginx, port 80) ──▶ [Frontend Pods × 2]
    │
    └──▶ /api ──▶ backend-service (port 5000) ──▶ [Backend Pods × 2]
                                                          │
                                                          ▼
                                              mongo-service (port 27017)
                                                          │
                                                          ▼
                                              [MongoDB StatefulSet + EBS 10Gi]

VPC (10.0.0.0/16)
├── Sous-réseaux publics  (us-west-2a, us-west-2b) → NAT Gateways, Load Balancers
└── Sous-réseaux privés   (us-west-2a, us-west-2b) → Nœuds EKS, Pods
```

---

## Prérequis

| Outil       | Version minimale | Installation |
|-------------|-----------------|--------------|
| Terraform   | 1.6+            | [terraform.io](https://developer.hashicorp.com/terraform/install) |
| AWS CLI     | 2.x             | `brew install awscli` |
| kubectl     | 1.29+           | `brew install kubectl` |
| Docker      | 24+             | [docker.com](https://docs.docker.com/get-docker/) |

### Configuration AWS

```bash
aws configure
# AWS Access Key ID     : <votre clé>
# AWS Secret Access Key : <votre secret>
# Default region name   : us-west-2
# Default output format : json
```

---

## Déploiement

### Option 1 — Script automatisé (recommandé)

```bash
chmod +x deploy.sh
./deploy.sh           # Déploiement complet : infra + images + k8s
./deploy.sh --infra   # Terraform uniquement
./deploy.sh --app     # Images Docker + manifests k8s uniquement
./deploy.sh --destroy # Supprimer toute l'infrastructure
```

### Option 2 — Étape par étape

#### 1. Déployer l'infrastructure Terraform

```bash
terraform init
terraform plan
terraform apply
```

#### 2. Récupérer les variables de sortie

```bash
CLUSTER_NAME=$(terraform output -raw cluster_name)
ECR_BACKEND=$(terraform output -raw ecr_backend_url)
ECR_FRONTEND=$(terraform output -raw ecr_frontend_url)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
```

#### 3. Configurer kubectl

```bash
aws eks update-kubeconfig --region us-west-2 --name $CLUSTER_NAME
kubectl get nodes   # Vérifier que les nœuds sont Ready
```

#### 4. Builder et pousser les images Docker

```bash
# Login ECR
aws ecr get-login-password --region us-west-2 \
  | docker login --username AWS --password-stdin \
    ${ACCOUNT_ID}.dkr.ecr.us-west-2.amazonaws.com

# Backend
docker build -t portfolio-backend ../Backend
docker tag portfolio-backend:latest ${ECR_BACKEND}:latest
docker push ${ECR_BACKEND}:latest

# Frontend
docker build -t portfolio-frontend ../Frontend
docker tag portfolio-frontend:latest ${ECR_FRONTEND}:latest
docker push ${ECR_FRONTEND}:latest
```

#### 5. Déployer les manifests Kubernetes

```bash
# Remplacer les placeholders d'image
sed -i "s|<ACCOUNT_ID>|${ACCOUNT_ID}|g; s|<REGION>|us-west-2|g" \
  k8s/01-backend.yaml k8s/02-frontend.yaml

# Appliquer les manifests
kubectl apply -f k8s/00-mongodb.yaml
kubectl apply -f k8s/01-backend.yaml
kubectl apply -f k8s/02-frontend.yaml
kubectl apply -f k8s/03-hpa.yaml

# Vérifier le déploiement
kubectl get all -n portfolio
```

#### 6. Récupérer l'URL publique

```bash
kubectl get svc frontend-service -n portfolio
# EXTERNAL-IP → URL du LoadBalancer AWS
```

---

## Structure des fichiers

```
terraform-eks/
├── main.tf                  # Point d'entrée Terraform (providers, modules)
├── variables.tf             # Déclaration des variables
├── outputs.tf               # Sorties (URLs ECR, endpoint cluster…)
├── terraform.tfvars         # Valeurs des variables
├── deploy.sh                # Script de déploiement automatisé
│
├── modules/
│   ├── vpc/                 # VPC, sous-réseaux, NAT Gateways
│   ├── ecr/                 # Registres Docker privés
│   └── eks/                 # Cluster EKS, Node Group, IAM, Add-ons
│
└── k8s/
    ├── 00-mongodb.yaml      # StatefulSet MongoDB + PVC EBS
    ├── 01-backend.yaml      # Deployment + Service backend Express
    ├── 02-frontend.yaml     # Deployment + Service LoadBalancer frontend
    └── 03-hpa.yaml          # Horizontal Pod Autoscaler
```

---

## Variables personnalisables

| Variable             | Défaut         | Description |
|----------------------|----------------|-------------|
| `aws_region`         | `us-west-2`    | Région AWS |
| `k8s_version`        | `1.29`         | Version Kubernetes |
| `node_instance_type` | `t3.medium`    | Type EC2 des nœuds |
| `node_desired_size`  | `2`            | Nœuds souhaités |
| `node_min_size`      | `1`            | Nœuds minimum |
| `node_max_size`      | `4`            | Nœuds maximum |
| `mongo_storage_size` | `10Gi`         | Taille volume MongoDB |
| `backend_replicas`   | `2`            | Réplicas backend |
| `frontend_replicas`  | `2`            | Réplicas frontend |

---

## Coûts estimés (us-west-2)

| Ressource              | Coût mensuel estimé |
|------------------------|---------------------|
| EKS Control Plane      | ~$73                |
| 2× EC2 t3.medium       | ~$60                |
| 2× NAT Gateway         | ~$65                |
| EBS 10Gi (MongoDB)     | ~$1                 |
| ECR (stockage images)  | ~$1                 |
| ALB Load Balancer      | ~$20                |
| **Total estimé**       | **~$220/mois**      |

> 💡 Pour réduire les coûts en dev/staging : utiliser `t3.small`, 1 NAT Gateway, 1 réplica par service.

---

## Destruction

```bash
# Supprimer les ressources Kubernetes en premier (libère les Load Balancers AWS)
kubectl delete namespace portfolio

# Détruire l'infrastructure Terraform
terraform destroy
```
