output "repository_urls" {
  description = "Map service → URL du dépôt ECR"
  value       = { for k, v in aws_ecr_repository.repos : k => v.repository_url }
}
