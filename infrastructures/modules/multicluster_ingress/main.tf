terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
    google-beta = {
      source = "hashicorp/google-beta"
    }
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
  }
}

data "google_client_config" "current" {}

provider "kubernetes" {
  host                   = "https://${var.primary_cluster_endpoint}"
  token                  = data.google_client_config.current.access_token
  cluster_ca_certificate = base64decode(var.primary_cluster_ca_certificate)
}

resource "google_project_service" "required_apis" {
  for_each = toset([
    "gkehub.googleapis.com",
    "multiclusterservicediscovery.googleapis.com",
    "multiclusteringress.googleapis.com"
  ])

  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

resource "google_gke_hub_membership" "primary" {
  provider      = google-beta
  project       = var.project_id
  membership_id = "${var.membership_name_prefix}-primary"

  endpoint {
    gke_cluster {
      resource_link = "//container.googleapis.com/projects/${var.project_id}/locations/${var.primary_cluster_location}/clusters/${var.primary_cluster_name}"
    }
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_gke_hub_membership" "failover" {
  provider      = google-beta
  count         = var.enable_failover_cluster ? 1 : 0
  project       = var.project_id
  membership_id = "${var.membership_name_prefix}-failover"

  endpoint {
    gke_cluster {
      resource_link = "//container.googleapis.com/projects/${var.project_id}/locations/${var.failover_cluster_location}/clusters/${var.failover_cluster_name}"
    }
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_gke_hub_feature" "mcs" {
  provider = google-beta
  project  = var.project_id
  location = "global"
  name     = "multiclusterservicediscovery"

  depends_on = [google_project_service.required_apis]
}

resource "kubernetes_manifest" "multicluster_service" {
  count = var.create_mci_k8s_resources ? 1 : 0

  manifest = {
    apiVersion = "networking.gke.io/v1"
    kind       = "MultiClusterService"
    metadata = {
      name      = var.mci_service_name
      namespace = var.k8s_namespace
    }
    spec = {
      template = {
        spec = {
          selector = {
            (var.mci_backend_label_key) = var.mci_backend_label_value
          }
          ports = [
            {
              name       = "http"
              protocol   = "TCP"
              port       = var.mci_service_port
              targetPort = var.mci_target_port
            }
          ]
        }
      }
    }
  }

  depends_on = [
    google_gke_hub_feature.mcs,
    google_project_service.required_apis,
    google_gke_hub_membership.primary,
    google_gke_hub_membership.failover
  ]
}

resource "kubernetes_manifest" "multicluster_ingress" {
  count = var.create_mci_k8s_resources ? 1 : 0

  manifest = {
    apiVersion = "networking.gke.io/v1"
    kind       = "MultiClusterIngress"
    metadata = {
      name      = var.mci_ingress_name
      namespace = var.k8s_namespace
    }
    spec = {
      template = {
        spec = {
          backend = {
            serviceName = var.mci_service_name
            servicePort = var.mci_service_port
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_manifest.multicluster_service,
    google_gke_hub_feature.mcs,
    google_project_service.required_apis
  ]
}

resource "kubernetes_manifest" "frontend_multicluster_service" {
  count = var.create_frontend_mci_k8s_resources ? 1 : 0

  manifest = {
    apiVersion = "networking.gke.io/v1"
    kind       = "MultiClusterService"
    metadata = {
      name      = var.frontend_mci_service_name
      namespace = var.k8s_namespace
    }
    spec = {
      template = {
        spec = {
          selector = {
            (var.frontend_mci_label_key) = var.frontend_mci_label_value
          }
          ports = [
            {
              name       = "http"
              protocol   = "TCP"
              port       = var.frontend_mci_service_port
              targetPort = var.frontend_mci_target_port
            }
          ]
        }
      }
    }
  }

  depends_on = [
    google_gke_hub_feature.mcs,
    google_project_service.required_apis,
    google_gke_hub_membership.primary,
    google_gke_hub_membership.failover
  ]
}

resource "kubernetes_manifest" "frontend_multicluster_ingress" {
  count = var.create_frontend_mci_k8s_resources ? 1 : 0

  manifest = {
    apiVersion = "networking.gke.io/v1"
    kind       = "MultiClusterIngress"
    metadata = {
      name      = var.frontend_mci_ingress_name
      namespace = var.k8s_namespace
    }
    spec = {
      template = {
        spec = {
          backend = {
            serviceName = var.frontend_mci_service_name
            servicePort = var.frontend_mci_service_port
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_manifest.frontend_multicluster_service,
    google_gke_hub_feature.mcs,
    google_project_service.required_apis
  ]
}
