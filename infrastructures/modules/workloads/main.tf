terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
  }
}

data "google_client_config" "current" {}

provider "kubernetes" {
  alias                  = "primary"
  host                   = "https://${var.primary_cluster_endpoint}"
  token                  = data.google_client_config.current.access_token
  cluster_ca_certificate = base64decode(var.primary_cluster_ca_certificate)
}

provider "kubernetes" {
  alias                  = "failover"
  host                   = try("https://${var.failover_cluster_endpoint}", null)
  token                  = data.google_client_config.current.access_token
  cluster_ca_certificate = try(base64decode(var.failover_cluster_ca_certificate), null)
}

resource "kubernetes_deployment_v1" "backend_primary" {
  provider         = kubernetes.primary
  wait_for_rollout = false

  metadata {
    name      = var.backend_app_name
    namespace = var.k8s_namespace
    labels = {
      app = var.backend_app_name
    }
  }

  spec {
    replicas = var.backend_replicas_primary

    selector {
      match_labels = {
        app = var.backend_app_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.backend_app_name
        }
      }

      spec {
        container {
          name              = var.backend_app_name
          image             = var.backend_image
          image_pull_policy = "Always"

          port {
            name           = "http"
            container_port = 8080
          }

          env_from {
            secret_ref {
              name = var.backend_secret_name
            }
          }

          liveness_probe {
            http_get {
              path = "/api/healthz"
              port = "http"
            }
            initial_delay_seconds = 30
            period_seconds        = 15
          }

          readiness_probe {
            http_get {
              path = "/api/healthz"
              port = "http"
            }
            initial_delay_seconds = 15
            period_seconds        = 10
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "backend_primary" {
  provider = kubernetes.primary

  metadata {
    name      = var.backend_app_name
    namespace = var.k8s_namespace
    labels = {
      app = var.backend_app_name
    }
  }

  spec {
    selector = {
      app = var.backend_app_name
    }

    port {
      name        = "http"
      port        = 80
      target_port = 8080
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_deployment_v1" "frontend_primary" {
  provider         = kubernetes.primary
  wait_for_rollout = false

  metadata {
    name      = var.frontend_app_name
    namespace = var.k8s_namespace
    labels = {
      app = var.frontend_app_name
    }
  }

  spec {
    replicas = var.frontend_replicas_primary

    selector {
      match_labels = {
        app = var.frontend_app_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.frontend_app_name
        }
      }

      spec {
        container {
          name              = var.frontend_app_name
          image             = var.frontend_image
          image_pull_policy = "Always"

          port {
            name           = "http"
            container_port = 80
          }

          env_from {
            secret_ref {
              name = var.frontend_secret_name
            }
          }

          liveness_probe {
            http_get {
              path = "/"
              port = "http"
            }
            initial_delay_seconds = 20
            period_seconds        = 15
          }

          readiness_probe {
            http_get {
              path = "/"
              port = "http"
            }
            initial_delay_seconds = 10
            period_seconds        = 10
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "frontend_primary" {
  provider = kubernetes.primary

  metadata {
    name      = var.frontend_app_name
    namespace = var.k8s_namespace
    labels = {
      app = var.frontend_app_name
    }
  }

  spec {
    selector = {
      app = var.frontend_app_name
    }

    port {
      name        = "http"
      port        = 80
      target_port = 80
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_deployment_v1" "backend_failover" {
  provider         = kubernetes.failover
  count            = var.enable_failover_cluster ? 1 : 0
  wait_for_rollout = false

  metadata {
    name      = var.backend_app_name
    namespace = var.k8s_namespace
    labels = {
      app = var.backend_app_name
    }
  }

  spec {
    replicas = var.backend_replicas_failover

    selector {
      match_labels = {
        app = var.backend_app_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.backend_app_name
        }
      }

      spec {
        container {
          name              = var.backend_app_name
          image             = var.backend_image
          image_pull_policy = "Always"

          port {
            name           = "http"
            container_port = 8080
          }

          env_from {
            secret_ref {
              name = var.backend_secret_name
            }
          }

          liveness_probe {
            http_get {
              path = "/api/healthz"
              port = "http"
            }
            initial_delay_seconds = 30
            period_seconds        = 15
          }

          readiness_probe {
            http_get {
              path = "/api/healthz"
              port = "http"
            }
            initial_delay_seconds = 15
            period_seconds        = 10
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "backend_failover" {
  provider = kubernetes.failover
  count    = var.enable_failover_cluster ? 1 : 0

  metadata {
    name      = var.backend_app_name
    namespace = var.k8s_namespace
    labels = {
      app = var.backend_app_name
    }
  }

  spec {
    selector = {
      app = var.backend_app_name
    }

    port {
      name        = "http"
      port        = 80
      target_port = 8080
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_deployment_v1" "frontend_failover" {
  provider         = kubernetes.failover
  count            = var.enable_failover_cluster ? 1 : 0
  wait_for_rollout = false

  metadata {
    name      = var.frontend_app_name
    namespace = var.k8s_namespace
    labels = {
      app = var.frontend_app_name
    }
  }

  spec {
    replicas = var.frontend_replicas_failover

    selector {
      match_labels = {
        app = var.frontend_app_name
      }
    }

    template {
      metadata {
        labels = {
          app = var.frontend_app_name
        }
      }

      spec {
        container {
          name              = var.frontend_app_name
          image             = var.frontend_image
          image_pull_policy = "Always"

          port {
            name           = "http"
            container_port = 80
          }

          env_from {
            secret_ref {
              name = var.frontend_secret_name
            }
          }

          liveness_probe {
            http_get {
              path = "/"
              port = "http"
            }
            initial_delay_seconds = 20
            period_seconds        = 15
          }

          readiness_probe {
            http_get {
              path = "/"
              port = "http"
            }
            initial_delay_seconds = 10
            period_seconds        = 10
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "frontend_failover" {
  provider = kubernetes.failover
  count    = var.enable_failover_cluster ? 1 : 0

  metadata {
    name      = var.frontend_app_name
    namespace = var.k8s_namespace
    labels = {
      app = var.frontend_app_name
    }
  }

  spec {
    selector = {
      app = var.frontend_app_name
    }

    port {
      name        = "http"
      port        = 80
      target_port = 80
    }

    type = "ClusterIP"
  }
}
