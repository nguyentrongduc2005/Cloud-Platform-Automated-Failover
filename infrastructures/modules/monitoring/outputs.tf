output "uptime_backend_check_id" {
  value = google_monitoring_uptime_check_config.backend.uptime_check_id
}

output "uptime_frontend_check_id" {
  value = google_monitoring_uptime_check_config.frontend.uptime_check_id
}

output "backend_error_metric_name" {
  value = google_logging_metric.backend_error_count.name
}

output "frontend_error_metric_name" {
  value = google_logging_metric.frontend_error_count.name
}
