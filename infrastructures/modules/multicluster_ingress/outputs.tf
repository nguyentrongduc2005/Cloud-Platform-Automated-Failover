output "primary_membership_id" {
  value = google_gke_hub_membership.primary.membership_id
}

output "failover_membership_id" {
  value = try(google_gke_hub_membership.failover[0].membership_id, null)
}

output "mci_name" {
  value = try(kubernetes_manifest.multicluster_ingress[0].manifest.metadata.name, null)
}

output "mcs_name" {
  value = try(kubernetes_manifest.multicluster_service[0].manifest.metadata.name, null)
}

output "mci_status" {
  value = try(kubernetes_manifest.multicluster_ingress[0].object.status, null)
}

output "frontend_mci_name" {
  value = try(kubernetes_manifest.frontend_multicluster_ingress[0].manifest.metadata.name, null)
}

output "frontend_mcs_name" {
  value = try(kubernetes_manifest.frontend_multicluster_service[0].manifest.metadata.name, null)
}

output "frontend_mci_status" {
  value = try(kubernetes_manifest.frontend_multicluster_ingress[0].object.status, null)
}
