# ══════════════════════════════════════════════════════════════════════
# variables.tf — Toutes les variables du module VPC + EC2
# ══════════════════════════════════════════════════════════════════════
#
# 💡 Comment passer des valeurs ?
#   Option 1 : terraform apply -var="aws_region=us-east-1"
#   Option 2 : Créer un fichier terraform.tfvars 
#   Option 3 : Variable d'environnement : export TF_VAR_aws_region=us-west-2
# ══════════════════════════════════════════════════════════════════════

variable "aws_region" {
  description = "Région AWS où créer les ressources"
  type        = string
  default     = "us-west-2"
}

variable "projet" {
  description = "Nom du projet — utilisé comme préfixe pour toutes les ressources"
  type        = string
  default     = "portfolio"
}

variable "vpc_cidr" {
  description = "CIDR block du VPC (plage d'adresses IP)"
  type        = string
  default     = "10.0.0.0/16"
  # 10.0.0.0/16 = 65 536 adresses IP disponibles
}

variable "subnet_cidr" {
  description = "CIDR block du subnet public"
  type        = string
  default     = "10.0.1.0/24"
  # 10.0.1.0/24 = 256 adresses IP disponibles
}

variable "instance_type" {
  description = "Type d'instance EC2 (taille du serveur)"
  type        = string
  default     = "t3.micro"
  # t3.micro = 2 vCPU, 1 GB RAM — gratuit avec le Free Tier AWS

  validation {
    condition     = contains(["t3.micro", "t3.small", "t3.medium"], var.instance_type)
    error_message = "Utilise t3.micro, t3.small ou t3.medium pour rester dans le Free Tier."
  }
}
