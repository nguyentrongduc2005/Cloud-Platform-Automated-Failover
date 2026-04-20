terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }
}

resource "google_monitoring_uptime_check_config" "frontend" {
  project      = var.project_id
  display_name = "apsas-frontend-uptime"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path = "/"
    port = 80
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      host = var.global_lb_ip
    }
  }
}

resource "google_monitoring_uptime_check_config" "backend" {
  project      = var.project_id
  display_name = "apsas-backend-uptime"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path = "/api/healthz"
    port = 80
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      host = var.global_lb_ip
    }
  }
}

resource "google_monitoring_notification_channel" "email" {
  for_each = toset(var.alert_email_addresses)

  project      = var.project_id
  display_name = "APSAS Alert Email ${each.value}"
  type         = "email"

  labels = {
    email_address = each.value
  }
}

locals {
  alert_notification_channels = [for channel in google_monitoring_notification_channel.email : channel.name]
}

resource "google_monitoring_alert_policy" "backend_uptime" {
  project               = var.project_id
  display_name          = "apsas-backend-uptime-alert"
  combiner              = "OR"
  notification_channels = local.alert_notification_channels

  conditions {
    display_name = "Backend uptime failed"
    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.backend.uptime_check_id}\""
      duration        = "300s"
      comparison      = "COMPARISON_LT"
      threshold_value = 1

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_FRACTION_TRUE"
      }
    }
  }

  documentation {
    content = "Backend health endpoint failed for at least 5 minutes. Check Cloud Run revisions and Cloud SQL connectivity."
  }
}

resource "google_monitoring_alert_policy" "frontend_uptime" {
  project               = var.project_id
  display_name          = "apsas-frontend-uptime-alert"
  combiner              = "OR"
  notification_channels = local.alert_notification_channels

  conditions {
    display_name = "Frontend uptime failed"
    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.frontend.uptime_check_id}\""
      duration        = "300s"
      comparison      = "COMPARISON_LT"
      threshold_value = 1

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_FRACTION_TRUE"
      }
    }
  }

  documentation {
    content = "Frontend root endpoint failed for at least 5 minutes. Validate frontend Cloud Run revisions and load balancer routing."
  }
}

resource "google_logging_metric" "backend_error_count" {
  project     = var.project_id
  name        = "apsas_backend_error_count"
  description = "Count backend Cloud Run error logs"
  filter      = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"${var.backend_service_name}-(primary|failover)\" AND severity>=ERROR"
}

resource "google_logging_metric" "frontend_error_count" {
  project     = var.project_id
  name        = "apsas_frontend_error_count"
  description = "Count frontend Cloud Run error logs"
  filter      = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=~\"${var.frontend_service_name}-(primary|failover)\" AND severity>=ERROR"
}

resource "google_monitoring_alert_policy" "backend_error_logs" {
  project               = var.project_id
  display_name          = "apsas-backend-error-logs-alert"
  combiner              = "OR"
  notification_channels = local.alert_notification_channels

  conditions {
    display_name = "Backend error logs > 0 in 5m"
    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.backend_error_count.name}\" AND resource.type=\"cloud_run_revision\""
      duration        = "0s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }

  documentation {
    content = "Backend emitted error logs. Check Logs Explorer for apsas-backend-primary/failover and inspect the failing revision stack trace."
  }
}

resource "google_monitoring_alert_policy" "frontend_error_logs" {
  project               = var.project_id
  display_name          = "apsas-frontend-error-logs-alert"
  combiner              = "OR"
  notification_channels = local.alert_notification_channels

  conditions {
    display_name = "Frontend error logs > 0 in 5m"
    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.frontend_error_count.name}\" AND resource.type=\"cloud_run_revision\""
      duration        = "0s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }

  documentation {
    content = "Frontend emitted error logs. Check Logs Explorer for apsas-frontend-primary/failover startup or nginx routing errors."
  }
}
