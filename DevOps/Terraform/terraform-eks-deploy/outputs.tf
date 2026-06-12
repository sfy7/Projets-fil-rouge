# ============================================================
# outputs.tf — Sorties Terraform
# ============================================================

output "cluster_name" {
  description = "Nom du cluster EKS"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint de l'API Kubernetes"
  value       = module.eks.cluster_endpoint
}

output "kubeconfig_command" {
  description = "Commande pour configurer kubectl"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "ecr_backend_url" {
  description = "URL du registre ECR — Backend"
  value       = module.ecr.repository_urls["backend"]
}

output "ecr_frontend_url" {
  description = "URL du registre ECR — Frontend"
  value       = module.ecr.repository_urls["frontend"]
}

output "vpc_id" {
  description = "ID du VPC"
  value       = module.vpc.vpc_id
}

output "docker_login_command" {
  description = "Commande de connexion ECR (Docker login)"
  value       = "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
}

output "push_commands" {
  description = "Commandes pour pousser les images Docker vers ECR"
  value = {
    backend = <<-EOT
      # Backend
      docker build -t portfolio-backend ./Backend
      docker tag portfolio-backend:latest ${module.ecr.repository_urls["backend"]}:latest
      docker push ${module.ecr.repository_urls["backend"]}:latest
    EOT
    frontend = <<-EOT
      # Frontend
      docker build -t portfolio-frontend ./Frontend
      docker tag portfolio-frontend:latest ${module.ecr.repository_urls["frontend"]}:latest
      docker push ${module.ecr.repository_urls["frontend"]}:latest
    EOT
  }
}
