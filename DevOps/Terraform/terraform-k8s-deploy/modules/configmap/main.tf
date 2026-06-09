# ══════════════════════════════════════════════════════════════════════
# MODULE : configmap
# Équivalent Terraform de : kubectl apply -f K8s/Base/configmap-and-secret.yaml
#
# Crée :
#   - ConfigMap "portfolio-config"   → variables non-sensibles
#   - Secret    "portfolio-secret"   → variables sensibles (mot de passe)
# ══════════════════════════════════════════════════════════════════════

variable "namespace" { type = string }
variable "node_env" { type = string }
variable "port" { type = string }
variable "mongo_uri" { type = string }
variable "cors_origin" { type = string }
variable "mongo_password" {
  type      = string
  sensitive = true # ← Terraform masque cette valeur dans les logs
}

# ─── ConfigMap : variables non-sensibles ──────────────────────────────
resource "kubernetes_config_map" "portfolio" {
  metadata {
    name      = "portfolio-config"
    namespace = var.namespace
  }

  data = {
    NODE_ENV    = var.node_env
    PORT        = var.port
    MONGO_URI   = var.mongo_uri
    CORS_ORIGIN = var.cors_origin
  }
}

# ─── Secret : variables sensibles ─────────────────────────────────────
# Terraform encode automatiquement en base64 (pas besoin de le faire manuellement !)
resource "kubernetes_secret" "portfolio" {
  metadata {
    name      = "portfolio-secret"
    namespace = var.namespace
  }

  # type Opaque = secret générique (le plus courant)
  type = "Opaque"

  data = {
    # Terraform gère l'encodage base64 automatiquement ici
    mongo-root-password = var.mongo_password
  }
}

# ─── Outputs ──────────────────────────────────────────────────────────
# Expose les noms des ressources créées pour que d'autres modules (ex: module MongoDB ou backend)
#...puissent les référencer avec module.configmap.configmap_name
output "configmap_name" {
  value = kubernetes_config_map.portfolio.metadata[0].name
}

output "secret_name" {
  value = kubernetes_secret.portfolio.metadata[0].name
}
