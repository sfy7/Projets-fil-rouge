# ══════════════════════════════════════════════════════════════════════
# outputs.tf — Informations affichées après terraform apply
# ══════════════════════════════════════════════════════════════════════

output "namespace" {
  description = "Le namespace Kubernetes utilisé"
  value       = module.namespace.namespace_name
}

output "frontend_url" {
  description = "URL d'accès au frontend (avec Minikube)"
  value       = "http://$(minikube ip):${var.frontend_nodeport}"
}

output "backend_image" {
  description = "Image Docker déployée pour le backend"
  value       = "${var.docker_hub_user}/${var.backend_image_name}:${var.image_tag}"
}

output "frontend_image" {
  description = "Image Docker déployée pour le frontend"
  value       = "${var.docker_hub_user}/${var.frontend_image_name}:${var.image_tag}"
}

output "commandes_utiles" {
  description = "Commandes kubectl pour surveiller le déploiement"
  value       = <<-EOT
    # Voir tous les pods
    kubectl get pods -n ${var.namespace}

    # Voir les services
    kubectl get services -n ${var.namespace}

    # Logs du backend
    kubectl logs -l app=backend -n ${var.namespace}

    # URL Frontend (Minikube)
    minikube service frontend-service -n ${var.namespace} --url
  EOT
}
