
# ══════════════════════════════════════════════════════════════════════
# MODULE : mongodb
# Déploie MongoDB en StatefulSet avec volume persistant
# ══════════════════════════════════════════════════════════════════════

variable "namespace" {
  type = string
}

resource "kubernetes_stateful_set" "mongodb" {
  metadata {
    name      = "mongo"
    namespace = var.namespace
    labels = {
      app = "mongo"
    }
  }

  spec {
    service_name = "mongo-headless"
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
            container_port = 27017
          }

          env {
            name  = "MONGO_INITDB_DATABASE"
            value = "portfolio"
          }

          volume_mount {
            name       = "mongo-data"
            mount_path = "/data/db"
          }

          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }

          readiness_probe {
            exec {
              command = [
                "mongosh",
                "--quiet",
                "--eval",
                "db.adminCommand('ping').ok || quit(1)"
              ]
            }
            initial_delay_seconds = 30
            period_seconds        = 15
            timeout_seconds       = 15
            failure_threshold     = 6
          }

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

    volume_claim_template {
      metadata {
        name = "mongo-data"
      }

      spec {
        access_modes = ["ReadWriteOnce"]

        resources {
          requests = {
            storage = "1Gi"
          }
        }
      }
    }
  }
}

output "mongodb_name" {
  value = kubernetes_stateful_set.mongodb.metadata[0].name
}