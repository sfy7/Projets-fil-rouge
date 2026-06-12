# ============================================================
# variables.tf — Variables du projet Portfolio EKS
# ============================================================

# ── Général ────────────────────────────────────────────────────────────────────
variable "aws_region" {
  description = "Région AWS cible"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Nom du projet (utilisé comme préfixe pour toutes les ressources)"
  type        = string
  default     = "portfolio"
}

variable "environment" {
  description = "Environnement de déploiement"
  type        = string
  default     = "production"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "L'environnement doit être : dev, staging ou prod."
  }
}

# ── VPC ────────────────────────────────────────────────────────────────────────
variable "vpc_cidr" {
  description = "CIDR du VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ── EKS ────────────────────────────────────────────────────────────────────────
variable "k8s_version" {
  description = "Version de Kubernetes pour le cluster EKS"
  type        = string
  default     = "1.29"
}

variable "node_instance_type" {
  description = "Type d'instance EC2 pour les nœuds worker"
  type        = string
  default     = "t3.medium"
}

variable "node_desired_size" {
  description = "Nombre souhaité de nœuds worker"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Nombre minimum de nœuds worker"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Nombre maximum de nœuds worker"
  type        = number
  default     = 4
}

# ── Application ────────────────────────────────────────────────────────────────
variable "backend_image_tag" {
  description = "Tag de l'image Docker du backend"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Tag de l'image Docker du frontend"
  type        = string
  default     = "latest"
}

variable "backend_replicas" {
  description = "Nombre de réplicas du backend"
  type        = number
  default     = 2
}

variable "frontend_replicas" {
  description = "Nombre de réplicas du frontend"
  type        = number
  default     = 2
}

variable "mongo_storage_size" {
  description = "Taille du volume persistant MongoDB (EBS)"
  type        = string
  default     = "10Gi"
}
