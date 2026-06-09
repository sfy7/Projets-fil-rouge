# ══════════════════════════════════════════════════════════════════════
# MODULE : namespace
# Équivalent Terraform de : kubectl apply -f K8s/Base/namespace.yaml
# ══════════════════════════════════════════════════════════════════════

variable "namespace" {
  description = "Nom du namespace à créer"
  type        = string
}

# ─── Ressource Kubernetes : Namespace ─────────────────────────────────
resource "kubernetes_namespace" "portfolio" {
  metadata {
    name = var.namespace

    labels = {
      app        = var.namespace
      managed_by = "terraform"
    }
  }
}

# ─── Output : expose le nom du namespace aux autres modules ───────────
output "namespace_name" {
  description = "Nom du namespace créé"
  value       = kubernetes_namespace.portfolio.metadata[0].name
}
