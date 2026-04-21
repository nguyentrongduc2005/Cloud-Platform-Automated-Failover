terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }
}

locals {
  # Convert integer weights (0..1000) into capacity scalers (0.0..1.0).
  backend_primary_capacity_scaler  = min(1.0, max(0.0, var.backend_primary_weight / 1000.0))
  backend_failover_capacity_scaler = min(1.0, max(0.0, var.backend_failover_weight / 1000.0))

  frontend_primary_capacity_scaler  = min(1.0, max(0.0, var.frontend_primary_weight / 1000.0))
  frontend_failover_capacity_scaler = min(1.0, max(0.0, var.frontend_failover_weight / 1000.0))
}

resource "google_compute_global_address" "lb_ip" {
  project = var.project_id
  name    = "${var.name_prefix}-global-lb-ip"
}

resource "google_compute_region_network_endpoint_group" "backend_primary" {
  project               = var.project_id
  name                  = "${var.name_prefix}-be-primary-neg"
  region                = var.primary_region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.backend_primary_service_name
  }
}

resource "google_compute_region_network_endpoint_group" "backend_failover" {
  project               = var.project_id
  name                  = "${var.name_prefix}-be-failover-neg"
  region                = var.secondary_region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.backend_failover_service_name
  }
}

resource "google_compute_region_network_endpoint_group" "frontend_primary" {
  project               = var.project_id
  name                  = "${var.name_prefix}-fe-primary-neg"
  region                = var.primary_region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.frontend_primary_service_name
  }
}

resource "google_compute_region_network_endpoint_group" "frontend_failover" {
  project               = var.project_id
  name                  = "${var.name_prefix}-fe-failover-neg"
  region                = var.secondary_region
  network_endpoint_type = "SERVERLESS"

  cloud_run {
    service = var.frontend_failover_service_name
  }
}

resource "google_compute_backend_service" "backend_api" {
  project               = var.project_id
  name                  = "${var.name_prefix}-backend-service"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  timeout_sec           = 30

  backend {
    group           = google_compute_region_network_endpoint_group.backend_primary.id
    balancing_mode  = "UTILIZATION"
    capacity_scaler = local.backend_primary_capacity_scaler
  }

  dynamic "backend" {
    for_each = var.enable_failover_backends ? [1] : []
    content {
      group           = google_compute_region_network_endpoint_group.backend_failover.id
      balancing_mode  = "UTILIZATION"
      capacity_scaler = local.backend_failover_capacity_scaler
    }
  }

  # Serverless NEGs do not use classic health checks; outlier detection ejects failing regions.
  outlier_detection {
    consecutive_errors                    = 5
    enforcing_consecutive_errors          = 100
    consecutive_gateway_failure           = 3
    enforcing_consecutive_gateway_failure = 100
    max_ejection_percent                  = 100

    interval {
      seconds = 10
    }

    base_ejection_time {
      seconds = 60
    }
  }
}

resource "google_compute_backend_service" "frontend_web" {
  project               = var.project_id
  name                  = "${var.name_prefix}-frontend-service"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  timeout_sec           = 30

  backend {
    group           = google_compute_region_network_endpoint_group.frontend_primary.id
    balancing_mode  = "UTILIZATION"
    capacity_scaler = local.frontend_primary_capacity_scaler
  }

  dynamic "backend" {
    for_each = var.enable_failover_backends ? [1] : []
    content {
      group           = google_compute_region_network_endpoint_group.frontend_failover.id
      balancing_mode  = "UTILIZATION"
      capacity_scaler = local.frontend_failover_capacity_scaler
    }
  }

  outlier_detection {
    consecutive_errors                    = 5
    enforcing_consecutive_errors          = 100
    consecutive_gateway_failure           = 3
    enforcing_consecutive_gateway_failure = 100
    max_ejection_percent                  = 100

    interval {
      seconds = 10
    }

    base_ejection_time {
      seconds = 60
    }
  }
}

resource "google_compute_url_map" "global" {
  project = var.project_id
  name    = "${var.name_prefix}-global-url-map"

  default_service = google_compute_backend_service.frontend_web.id

  path_matcher {
    name            = "all"
    default_service = google_compute_backend_service.frontend_web.id

    route_rules {
      priority = 1
      match_rules {
        prefix_match = "/api"
      }
      service = google_compute_backend_service.backend_api.id
    }
  }

  host_rule {
    hosts        = ["*"]
    path_matcher = "all"
  }
}

resource "google_compute_target_http_proxy" "http" {
  project = var.project_id
  name    = "${var.name_prefix}-http-proxy"
  url_map = google_compute_url_map.global.id
}

resource "google_compute_global_forwarding_rule" "http" {
  project               = var.project_id
  name                  = "${var.name_prefix}-http-forwarding-rule"
  target                = google_compute_target_http_proxy.http.id
  ip_address            = google_compute_global_address.lb_ip.id
  port_range            = "80"
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
