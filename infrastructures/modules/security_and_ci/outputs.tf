output "artifact_registry_repository" {
  value = google_artifact_registry_repository.containers.repository_id
}

output "artifact_registry_repository_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.containers.repository_id}"
}

output "cicd_service_account_email" {
  value = google_service_account.cicd.email
}

output "github_workload_identity_provider" {
  value = google_iam_workload_identity_pool_provider.github.name
}

output "github_workload_identity_pool" {
  value = google_iam_workload_identity_pool.github.name
}
