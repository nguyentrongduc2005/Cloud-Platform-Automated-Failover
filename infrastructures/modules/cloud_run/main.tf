terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }
}

data "google_project" "current" {
  project_id = var.project_id
}

locals {
  # Cloud Run reserves these env vars; user-provided values must be ignored.
  reserved_env_names = toset(["PORT", "K_SERVICE", "K_REVISION", "K_CONFIGURATION"])

  backend_env_vars_primary_filtered   = { for k, v in var.backend_env_vars_primary : k => v if !contains(local.reserved_env_names, k) }
  backend_env_vars_failover_filtered  = { for k, v in var.backend_env_vars_failover : k => v if !contains(local.reserved_env_names, k) }
  frontend_env_vars_primary_filtered  = { for k, v in var.frontend_env_vars_primary : k => v if !contains(local.reserved_env_names, k) }
  frontend_env_vars_failover_filtered = { for k, v in var.frontend_env_vars_failover : k => v if !contains(local.reserved_env_names, k) }
}

resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "vpcaccess.googleapis.com"
  ])

  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

resource "google_service_account" "runtime" {
  project      = var.project_id
  account_id   = var.runtime_service_account_id
  display_name = "APSAS Cloud Run Runtime"
}

resource "google_project_iam_member" "runtime_cloudsql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_project_iam_member" "runtime_logs" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_project_iam_member" "runtime_metrics" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.runtime.email}"
}

resource "google_vpc_access_connector" "primary" {
  project       = var.project_id
  name          = var.primary_vpc_connector_name
  region        = var.primary_region
  network       = var.network_name
  ip_cidr_range = var.primary_vpc_connector_cidr
  min_instances = var.vpc_connector_min_instances
  max_instances = var.vpc_connector_max_instances

  depends_on = [google_project_service.required_apis]
}

resource "google_vpc_access_connector" "failover" {
  project       = var.project_id
  name          = var.secondary_vpc_connector_name
  region        = var.secondary_region
  network       = var.network_name
  ip_cidr_range = var.secondary_vpc_connector_cidr
  min_instances = var.vpc_connector_min_instances
  max_instances = var.vpc_connector_max_instances

  depends_on = [google_project_service.required_apis]
}

resource "google_cloud_run_v2_service" "backend_primary" {
  project             = var.project_id
  name                = "${var.backend_service_name}-primary"
  location            = var.primary_region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = var.cloud_run_deletion_protection

  template {
    service_account = google_service_account.runtime.email

    scaling {
      min_instance_count = var.backend_min_instances_primary
      max_instance_count = var.backend_max_instances_primary
    }

    vpc_access {
      connector = google_vpc_access_connector.primary.id
      egress    = "ALL_TRAFFIC"
    }

    containers {
      image = var.backend_image

      ports {
        container_port = 8080
      }

      dynamic "env" {
        for_each = local.backend_env_vars_primary_filtered
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

resource "google_cloud_run_v2_service" "backend_failover" {
  project             = var.project_id
  name                = "${var.backend_service_name}-failover"
  location            = var.secondary_region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = var.cloud_run_deletion_protection

  template {
    service_account = google_service_account.runtime.email

    scaling {
      min_instance_count = var.backend_min_instances_failover
      max_instance_count = var.backend_max_instances_failover
    }

    vpc_access {
      connector = google_vpc_access_connector.failover.id
      egress    = "ALL_TRAFFIC"
    }

    containers {
      image = var.backend_image

      ports {
        container_port = 8080
      }

      dynamic "env" {
        for_each = local.backend_env_vars_failover_filtered
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

resource "google_cloud_run_v2_service" "frontend_primary" {
  project             = var.project_id
  name                = "${var.frontend_service_name}-primary"
  location            = var.primary_region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = var.cloud_run_deletion_protection

  template {
    service_account = google_service_account.runtime.email

    scaling {
      min_instance_count = var.frontend_min_instances_primary
      max_instance_count = var.frontend_max_instances_primary
    }

    containers {
      image = var.frontend_image

      ports {
        container_port = 80
      }

      dynamic "env" {
        for_each = local.frontend_env_vars_primary_filtered
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

resource "google_cloud_run_v2_service" "frontend_failover" {
  project             = var.project_id
  name                = "${var.frontend_service_name}-failover"
  location            = var.secondary_region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = var.cloud_run_deletion_protection

  template {
    service_account = google_service_account.runtime.email

    scaling {
      min_instance_count = var.frontend_min_instances_failover
      max_instance_count = var.frontend_max_instances_failover
    }

    containers {
      image = var.frontend_image

      ports {
        container_port = 80
      }

      dynamic "env" {
        for_each = local.frontend_env_vars_failover_filtered
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }

  traffic {
    percent = 100
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
  }
}

resource "google_cloud_run_service_iam_member" "backend_primary_invoker" {
  count    = var.allow_unauthenticated_invoker ? 1 : 0
  project  = var.project_id
  location = var.primary_region
  service  = google_cloud_run_v2_service.backend_primary.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "backend_failover_invoker" {
  count    = var.allow_unauthenticated_invoker ? 1 : 0
  project  = var.project_id
  location = var.secondary_region
  service  = google_cloud_run_v2_service.backend_failover.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "frontend_primary_invoker" {
  count    = var.allow_unauthenticated_invoker ? 1 : 0
  project  = var.project_id
  location = var.primary_region
  service  = google_cloud_run_v2_service.frontend_primary.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "frontend_failover_invoker" {
  count    = var.allow_unauthenticated_invoker ? 1 : 0
  project  = var.project_id
  location = var.secondary_region
  service  = google_cloud_run_v2_service.frontend_failover.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
