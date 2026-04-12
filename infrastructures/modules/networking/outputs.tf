output "network_id" {
  value = google_compute_network.vpc.id
}

output "network_name" {
  value = google_compute_network.vpc.name
}

output "primary_subnetwork_name" {
  value = google_compute_subnetwork.primary_subnet.name
}

output "failover_subnetwork_name" {
  value = google_compute_subnetwork.failover_subnet.name
}
