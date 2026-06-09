# ══════════════════════════════════════════════════════════════════════
# MODULE : deployments
# Équivalent Terraform de :
#   kubectl apply -f ...
# Crée :
#   - StatefulSet  : MongoDB (avec volume persistant)
#   - Deployment   : Backend  Node.js (2 réplicas)
#   - Deployment   : Frontend React/Nginx (2 réplicas)
# ══════════════════════════════════════════════════════════════════════

# Paramètres reçus depuis main.tf
variable "namespace" {
  type = string
}

variable "backend_image" {
  type = string # ex: "sfy7/portfolio-backend:42"
}

variable "frontend_image" {
  type = string # ex: "sfy7/portfolio-frontend:42"
}

variable "backend_replicas" {
  type    = number
  default = 2
}

variable "frontend_replicas" {
  type    = number
  default = 2
}

variable "configmap_name" {
  type = string
}

# ══════════════════════════════════════════════════════════════════════
# 1. MONGODB — StatefulSet
#
# StatefulSet (et non Deployment) car MongoDB a besoin :
#   - d'un nom de pod stable (mongo-0, mongo-1...)
#   - d'un volume persistant dédié par pod (les données survivent aux redémarrages)
# ══════════════════════════════════════════════════════════════════════
resource "kubernetes_stateful_set" "mongodb" {
  metadata {
    name      = "mongo"
    namespace = var.namespace
    labels = {
      app = "mongo"
    }
  }

  spec {
    service_name = "mongo-headless" # Service headless requis pour les DNS stables des pods
    replicas     = 1

    selector {
      match_labels = {
        app = "mongo"
      }
    }

    template {
      metadata {
        labels = {
          app = "mongo"
        }
      }

      spec {
        container {
          name  = "mongo"
          image = "mongo:7"

          port {
            container_port = 27017 # Port MongoDB par défaut
          }

          env {
            name  = "MONGO_INITDB_DATABASE"
            value = "portfolio" # Crée la base "portfolio" au premier démarrage
          }

          # Monte le volume persistant dans le container
          volume_mount {
            name       = "mongo-data"
            mount_path = "/data/db" # Dossier de données MongoDB
          }

          resources {
            requests = {
              memory = "256Mi" # Mémoire minimale garantie au pod
              cpu    = "250m"  # 250 millicores = 0.25 CPU
            }
            limits = {
              memory = "512Mi" # Mémoire maximale autorisée
              cpu    = "500m"
            }
          }

          # readiness_probe : Kubernetes envoie du trafic au pod seulement quand cette probe réussit
          readiness_probe {
            exec {
              command = [
                "mongosh",
                "--quiet",
                "--eval",
                "db.adminCommand('ping').ok || quit(1)"
              ]
            }
            initial_delay_seconds = 30 # Attend 30s avant le 1er check (MongoDB démarre lentement)
            period_seconds        = 15
            timeout_seconds       = 15
            failure_threshold     = 6
          }

          # liveness_probe : Kubernetes redémarre le pod si cette probe échoue
          liveness_probe {
            exec {
              command = [
                "mongosh",
                "--quiet",
                "--eval",
                "db.adminCommand('ping').ok || quit(1)"
              ]
            }
            initial_delay_seconds = 60
            period_seconds        = 30
            timeout_seconds       = 15
            failure_threshold     = 3
          }
        }
      }
    }

    # Crée automatiquement un PersistentVolumeClaim pour chaque pod MongoDB
    volume_claim_template {
      metadata {
        name = "mongo-data"
      }

      spec {
        access_modes = ["ReadWriteOnce"] # Un seul pod peut écrire à la fois

        resources {
          requests = {
            storage = "1Gi"
          }
        }
      }
    }
  }
}

# ══════════════════════════════════════════════════════════════════════
# 2. BACKEND — Deployment Node.js
#
# Deployment (et non StatefulSet) car le backend est stateless :
# chaque pod est identique, pas besoin de nom stable ni de volume dédié.
# ══════════════════════════════════════════════════════════════════════
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend-deployment"
    namespace = var.namespace
    labels = {
      app = "backend"
    }
  }

  spec {
    replicas = var.backend_replicas # 2 pods par défaut (haute disponibilité)

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        container {
          name              = "backend"
          image             = var.backend_image
          image_pull_policy = "Always" # Toujours récupérer l'image depuis Docker Hub (évite un cache obsolète)

          port {
            container_port = 5000
          }

          # Les variables d'env sont lues depuis le ConfigMap "portfolio-config"
          # (créé par le module configmap) — pas de valeurs codées en dur ici
          env {
            name = "NODE_ENV"
            value_from {
              config_map_key_ref {
                name = var.configmap_name
                key  = "NODE_ENV"
              }
            }
          }

          env {
            name = "PORT"
            value_from {
              config_map_key_ref {
                name = var.configmap_name
                key  = "PORT"
              }
            }
          }

          env {
            name = "MONGO_URI"
            value_from {
              config_map_key_ref {
                name = var.configmap_name
                key  = "MONGO_URI"
              }
            }
          }

          env {
            name = "CORS_ORIGIN"
            value_from {
              config_map_key_ref {
                name = var.configmap_name
                key  = "CORS_ORIGIN"
              }
            }
          }

          resources {
            requests = {
              memory = "128Mi"
              cpu    = "100m"
            }
            limits = {
              memory = "256Mi"
              cpu    = "300m"
            }
          }

          liveness_probe {
            http_get {
              path = "/api/projets" # Route existante dans Express
              port = 5000
            }
            initial_delay_seconds = 30
            period_seconds        = 15
            timeout_seconds       = 5
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/api/projets"
              port = 5000
            }
            initial_delay_seconds = 15
            period_seconds        = 10
            timeout_seconds       = 3
            failure_threshold     = 5
          }
        }
      }
    }
  }
}

# ══════════════════════════════════════════════════════════════════════
# 3. FRONTEND — Deployment React/Nginx
#
# Nginx sert les fichiers statiques buildés (npm run build).
# Totalement stateless → simple Deployment suffit.
# ══════════════════════════════════════════════════════════════════════
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend-deployment"
    namespace = var.namespace
    labels = {
      app = "frontend"
    }
  }

  spec {
    replicas = var.frontend_replicas

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        container {
          name              = "frontend"
          image             = var.frontend_image
          image_pull_policy = "Always"

          port {
            container_port = 80 # Port Nginx par défaut
          }

          resources {
            requests = {
              memory = "64Mi" # Frontend léger : Nginx consomme peu
              cpu    = "50m"
            }
            limits = {
              memory = "128Mi"
              cpu    = "200m"
            }
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 10
            period_seconds        = 15
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 5
            period_seconds        = 10
          }
        }
      }
    }
  }
}

# ─── Outputs — valeurs renvoyées au module parent (main.tf) ───────────
output "mongodb_name" {
  value = kubernetes_stateful_set.mongodb.metadata[0].name
}

output "backend_name" {
  value = kubernetes_deployment.backend.metadata[0].name
}

output "frontend_name" {
  value = kubernetes_deployment.frontend.metadata[0].name
}
