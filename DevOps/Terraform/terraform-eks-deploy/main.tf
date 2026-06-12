# ============================================================
# main.tf — Déploiement du Portfolio sur AWS EKS
# ============================================================
# Architecture :
#   VPC (2 AZ) → EKS Cluster → Node Group (EC2)
#   ECR (backend + frontend) → Kubernetes manifests
#   MongoDB déployé en StatefulSet avec EBS PersistentVolume
# ============================================================

terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
  }

  # ── Backend S3 (décommenter après création du bucket) ──────────────────────
  # backend "s3" {
  #   bucket         = "portfolio-tfstate-<account_id>"
  #   key            = "eks/terraform.tfstate"
  #   region         = "us-west-2"
  #   dynamodb_table = "portfolio-tfstate-lock"
  #   encrypt        = true
  # }
}

# ── Provider AWS ───────────────────────────────────────────────────────────────
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ── Provider Kubernetes (configuré dynamiquement après création du cluster) ───
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args = [
      "eks", "get-token",
      "--cluster-name", module.eks.cluster_name,
      "--region", var.aws_region,
    ]
  }
}

# ── Provider Helm ──────────────────────────────────────────────────────────────
provider "helm" {
  kubernetes = {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_ca_certificate)

    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args = [
        "eks", "get-token",
        "--cluster-name", module.eks.cluster_name,
        "--region", var.aws_region,
      ]
    }
  }
}

# ── Data sources ───────────────────────────────────────────────────────────────
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ── Modules ────────────────────────────────────────────────────────────────────

module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  services     = ["backend", "frontend"]
}

module "eks" {
  source = "./modules/eks"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids
  k8s_version        = var.k8s_version
  node_instance_type = var.node_instance_type
  node_desired_size  = var.node_desired_size
  node_min_size      = var.node_min_size
  node_max_size      = var.node_max_size
  account_id         = data.aws_caller_identity.current.account_id
}
