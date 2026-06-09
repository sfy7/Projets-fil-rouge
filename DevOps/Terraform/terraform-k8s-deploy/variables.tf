# ══════════════════════════════════════════════════════════════════════
# variables.tf — Variables du déploiement Kubernetes
# ══════════════════════════════════════════════════════════════════════

# ─── Kubernetes ───────────────────────────────────────────────────────
variable "kubeconfig_path" {
  description = "Chemin vers le fichier kubeconfig"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Contexte Kubernetes à utiliser (minikube, docker-desktop...)"
  type        = string
  default     = "minikube"
}

variable "namespace" {
  description = "Namespace Kubernetes où déployer l'application"
  type        = string
  default     = "portfolio"
}

# ─── Docker Hub ───────────────────────────────────────────────────────
variable "docker_hub_user" {
  description = "Ton username Docker Hub"
  type        = string
  default     = "sfy7"
}

variable "backend_image_name" {
  description = "Nom de l'image Docker du backend"
  type        = string
  default     = "portfolio-backend"
}

variable "frontend_image_name" {
  description = "Nom de l'image Docker du frontend"
  type        = string
  default     = "portfolio-frontend"
}

variable "image_tag" {
  description = "Tag des images Docker (ex: latest, ou le BUILD_NUMBER Jenkins)"
  type        = string
  default     = "latest"
}

# ─── Application ──────────────────────────────────────────────────────
variable "node_env" {
  description = "Environnement Node.js"
  type        = string
  default     = "production"
}

variable "app_port" {
  description = "Port du backend"
  type        = string
  default     = "5000"
}

variable "mongo_uri" {
  description = "URI de connexion MongoDB (interne au cluster K8s)"
  type        = string
  default     = "mongodb://mongo-service:27017/portfolio"
}

variable "cors_origin" {
  description = "Origine autorisée pour les requêtes CORS"
  type        = string
  default     = "http://localhost:30080"
}

variable "mongo_root_password" {
  description = "Mot de passe root MongoDB (sensible !)"
  type        = string
  default     = "password123"
  sensitive   = true # ← Terraform ne l'affiche pas dans les logs
}

variable "frontend_nodeport" {
  description = "NodePort pour exposer le frontend (accès : localhost:30080)"
  type        = number
  default     = 30080
}

# ─── Réplicas ─────────────────────────────────────────────────────────
variable "backend_replicas" {
  description = "Nombre de pods backend"
  type        = number
  default     = 2
}

variable "frontend_replicas" {
  description = "Nombre de pods frontend"
  type        = number
  default     = 2
}
