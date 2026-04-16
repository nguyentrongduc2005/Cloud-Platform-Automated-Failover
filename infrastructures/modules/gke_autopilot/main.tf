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

resource "google_container_cluster" "primary" {
  name                = "${var.cluster_name_prefix}-primary-gke"
  project             = var.project_id
  location            = var.primary_region
  enable_autopilot    = true
  network             = var.network_name
  subnetwork          = var.primary_subnetwork_name
  deletion_protection = var.cluster_deletion_protection

  release_channel {
    channel = var.release_channel
  }

  ip_allocation_policy {
    cluster_secondary_range_name  = var.primary_pod_range_name
    services_secondary_range_name = var.primary_service_range_name
  }
}

resource "google_container_cluster" "failover" {
  count               = var.enable_failover_cluster ? 1 : 0
  name                = "${var.cluster_name_prefix}-failover-gke"
  project             = var.project_id
  location            = var.failover_region
  enable_autopilot    = true
  network             = var.network_name
  subnetwork          = var.failover_subnetwork_name
  deletion_protection = var.cluster_deletion_protection

  release_channel {
    channel = var.release_channel
  }

  ip_allocation_policy {
    cluster_secondary_range_name  = var.failover_pod_range_name
    services_secondary_range_name = var.failover_service_range_name
  }
}

provider "kubernetes" {
  alias                  = "primary"
  host                   = "https://${google_container_cluster.primary.endpoint}"
  token                  = data.google_client_config.current.access_token
  cluster_ca_certificate = base64decode(google_container_cluster.primary.master_auth[0].cluster_ca_certificate)
}

provider "kubernetes" {
  alias                  = "failover"
  host                   = try("https://${google_container_cluster.failover[0].endpoint}", null)
  token                  = data.google_client_config.current.access_token
  cluster_ca_certificate = try(base64decode(google_container_cluster.failover[0].master_auth[0].cluster_ca_certificate), null)
}

resource "kubernetes_namespace_v1" "primary_app" {
  provider = kubernetes.primary
  count    = var.create_namespace && var.k8s_namespace != "default" ? 1 : 0

  metadata {
    name = var.k8s_namespace
  }

  depends_on = [google_container_cluster.primary]
}

resource "kubernetes_namespace_v1" "failover_app" {
  provider = kubernetes.failover
  count    = var.enable_failover_cluster && var.create_namespace && var.k8s_namespace != "default" ? 1 : 0

  metadata {
    name = var.k8s_namespace
  }

  depends_on = [google_container_cluster.failover]
}

resource "kubernetes_secret_v1" "backend_env_primary" {
  provider = kubernetes.primary
  count    = length(var.backend_env_vars_primary) > 0 ? 1 : 0

  metadata {
    name      = var.backend_secret_name
    namespace = var.k8s_namespace
  }

  type = "Opaque"
  data = var.backend_env_vars_primary

  depends_on = [
    google_container_cluster.primary,
    kubernetes_namespace_v1.primary_app
  ]
}

resource "kubernetes_secret_v1" "frontend_env_primary" {
  provider = kubernetes.primary
  count    = length(var.frontend_env_vars_primary) > 0 ? 1 : 0

  metadata {
    name      = var.frontend_secret_name
    namespace = var.k8s_namespace
  }

  type = "Opaque"
  data = var.frontend_env_vars_primary

  depends_on = [
    google_container_cluster.primary,
    kubernetes_namespace_v1.primary_app
  ]
}

resource "kubernetes_secret_v1" "backend_env_failover" {
  provider = kubernetes.failover
  count    = var.enable_failover_cluster && length(var.backend_env_vars_failover) > 0 ? 1 : 0

  metadata {
    name      = var.backend_secret_name
    namespace = var.k8s_namespace
  }

  type = "Opaque"
  data = var.backend_env_vars_failover

  depends_on = [
    google_container_cluster.failover,
    kubernetes_namespace_v1.failover_app
  ]
}

resource "kubernetes_secret_v1" "frontend_env_failover" {
  provider = kubernetes.failover
  count    = var.enable_failover_cluster && length(var.frontend_env_vars_failover) > 0 ? 1 : 0

  metadata {
    name      = var.frontend_secret_name
    namespace = var.k8s_namespace
  }

  type = "Opaque"
  data = var.frontend_env_vars_failover

  depends_on = [
    google_container_cluster.failover,
    kubernetes_namespace_v1.failover_app
  ]
}
