output "primary_cluster_name" {
  value = google_container_cluster.primary.name
}

output "primary_cluster_location" {
  value = google_container_cluster.primary.location
}

output "primary_cluster_endpoint" {
  value = google_container_cluster.primary.endpoint
}

output "primary_cluster_ca_certificate" {
  value     = google_container_cluster.primary.master_auth[0].cluster_ca_certificate
  sensitive = true
}

output "failover_cluster_name" {
  value = try(google_container_cluster.failover[0].name, null)
}

output "failover_cluster_location" {
  value = try(google_container_cluster.failover[0].location, null)
}

output "failover_cluster_endpoint" {
  value = try(google_container_cluster.failover[0].endpoint, null)
}

output "failover_cluster_ca_certificate" {
  value     = try(google_container_cluster.failover[0].master_auth[0].cluster_ca_certificate, null)
  sensitive = true
}

output "k8s_namespace" {
  value = var.k8s_namespace
}

output "backend_secret_name" {
  value = var.backend_secret_name
}

output "frontend_secret_name" {
  value = var.frontend_secret_name
}
