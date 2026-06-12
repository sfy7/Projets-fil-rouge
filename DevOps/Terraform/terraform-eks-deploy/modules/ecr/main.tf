# ============================================================
# modules/ecr/main.tf — Elastic Container Registry
# ============================================================
# Crée un dépôt ECR privé pour chaque service (backend, frontend).
# - Scan de vulnérabilités activé à chaque push
# - Politique de cycle de vie : conserve les 10 dernières images
# - Chiffrement AES-256 natif
# ============================================================

resource "aws_ecr_repository" "repos" {
  for_each = toset(var.services)

  name                 = "${var.project_name}-${each.key}"
  image_tag_mutability = "MUTABLE"   # Permet de réutiliser "latest"
  force_delete         = true        # Supprime les images lors du destroy Terraform

  image_scanning_configuration {
    scan_on_push = true   # Scan de sécurité automatique à chaque push
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name    = "${var.project_name}-${each.key}"
    Service = each.key
  }
}

# ── Politique de cycle de vie ─────────────────────────────────────────────────
# Garde uniquement les 10 dernières images taguées → contrôle des coûts stockage
resource "aws_ecr_lifecycle_policy" "repos" {
  for_each   = aws_ecr_repository.repos
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Conserver les 10 dernières images taguées"
        selection = {
          tagStatus   = "tagged"
          tagPrefixList = ["v", "latest"]
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Supprimer les images non taguées après 7 jours"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      }
    ]
  })
}
