# ══════════════════════════════════════════════════════════════════════
# MODULE : services
# Équivalent Terraform de : kubectl apply -f K8s/services.yaml
#
# Crée 4 services :
#   1. mongo-service    → ClusterIP  : MongoDB accessible en interne
#   2. mongo-headless   → Headless   : DNS stable pour le StatefulSet
#   3. backend-service  → ClusterIP  : Backend accessible en interne
#   4. frontend-service → NodePort   : Frontend accessible depuis l'extérieur
# ══════════════════════════════════════════════════════════════════════

variable "namespace" {
  type = string
}

variable "nodeport" {
  type    = number
  default = 30080
}

variable "frontend_service_type" {
  type    = string
  default = "NodePort"
}

# ──────────────────────────────────────────────────────────────────────
# SERVICE 1 : MongoDB ClusterIP
# Accessible uniquement à l'intérieur du cluster
# Le Backend s'y connecte via "mongo-service:27017"
# ──────────────────────────────────────────────────────────────────────
resource "kubernetes_service" "mongo" {
  metadata {
    name      = "mongo-service"
    namespace = var.namespace
    labels = {
      app = "mongo"
    }
  }

  spec {
    selector = {
      app = "mongo"
    }
    type = "ClusterIP" # Pas d'accès extérieur

    port {
      protocol    = "TCP"
      port        = 27017
      target_port = 27017
    }
  }
}

# ──────────────────────────────────────────────────────────────────────
# SERVICE 2 : MongoDB Headless
# clusterIP: None → donne un nom DNS stable à chaque Pod du StatefulSet
# Nom DNS : mongo-0.mongo-headless.portfolio.svc.cluster.local
# ──────────────────────────────────────────────────────────────────────
resource "kubernetes_service" "mongo_headless" {
  metadata {
    name      = "mongo-headless"
    namespace = var.namespace
    labels = {
      app = "mongo"
    }
  }

  spec {
    selector = {
      app = "mongo"
    }
    cluster_ip = "None" # ← C'est ça qui le rend "headless"

    port {
      protocol    = "TCP"
      port        = 27017
      target_port = 27017
    }
  }
}

# ──────────────────────────────────────────────────────────────────────
# SERVICE 3 : Backend ClusterIP
# Le Frontend (Nginx) se connecte au Backend via "backend-service:5000"
# ──────────────────────────────────────────────────────────────────────
resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend-service"
    namespace = var.namespace
    labels = {
      app = "backend"
    }
  }

  spec {
    selector = {
      app = "backend"
    }
    type = "ClusterIP"

    port {
      protocol    = "TCP"
      port        = 5000
      target_port = 5000
    }
  }
}

# ──────────────────────────────────────────────────────────────────────
# SERVICE 4 : Frontend NodePort
# Accessible depuis l'extérieur du cluster
# Équivalent du "ports: 8080:80" dans docker-compose.yaml
# Accès : http://<minikube-ip>:30080
# ──────────────────────────────────────────────────────────────────────
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend-service"
    namespace = var.namespace
    labels = {
      app = "frontend"
    }
  }

  spec {
    selector = {
      app = "frontend"
    }
    type = var.frontend_service_type

    port {
      protocol    = "TCP"
      port        = 80
      target_port = 80
      node_port   = var.frontend_service_type == "NodePort" ? var.nodeport : null
    }
  }
}

# ─── Outputs ──────────────────────────────────────────────────────────
output "frontend_nodeport" {
  description = "Le NodePort du frontend (accès externe)"
  value       = var.frontend_service_type == "NodePort" ? var.nodeport : null
}

output "frontend_lb_hostname" {
  description = "Hostname du LoadBalancer (EKS uniquement)"
  value       = var.frontend_service_type == "LoadBalancer" ? try(kubernetes_service.frontend.status[0].load_balancer[0].ingress[0].hostname, "") : ""
}

output "backend_service_name" {
  value = kubernetes_service.backend.metadata[0].name
}
