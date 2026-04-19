output "runtime_service_account_email" {
  value = google_service_account.runtime.email
}

output "backend_primary_name" {
  value = google_cloud_run_v2_service.backend_primary.name
}

output "backend_failover_name" {
  value = google_cloud_run_v2_service.backend_failover.name
}

output "frontend_primary_name" {
  value = google_cloud_run_v2_service.frontend_primary.name
}

output "frontend_failover_name" {
  value = google_cloud_run_v2_service.frontend_failover.name
}

output "backend_primary_region" {
  value = google_cloud_run_v2_service.backend_primary.location
}

output "backend_failover_region" {
  value = google_cloud_run_v2_service.backend_failover.location
}

output "frontend_primary_region" {
  value = google_cloud_run_v2_service.frontend_primary.location
}

output "frontend_failover_region" {
  value = google_cloud_run_v2_service.frontend_failover.location
}

output "backend_primary_url" {
  value = google_cloud_run_v2_service.backend_primary.uri
}

output "backend_failover_url" {
  value = google_cloud_run_v2_service.backend_failover.uri
}

output "frontend_primary_url" {
  value = google_cloud_run_v2_service.frontend_primary.uri
}

output "frontend_failover_url" {
  value = google_cloud_run_v2_service.frontend_failover.uri
}
