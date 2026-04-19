variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Region for Artifact Registry"
  type        = string
}

variable "artifact_registry_repo_id" {
  description = "Artifact Registry repository ID"
  type        = string
  default     = "apsas-apps"
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format"
  type        = string
}

variable "github_branch" {
  description = "Git branch allowed to use OIDC provider"
  type        = string
  default     = "main"
}

variable "workload_identity_pool_id" {
  description = "Workload Identity Pool ID"
  type        = string
  default     = "github-pool"
}

variable "workload_identity_provider_id" {
  description = "Workload Identity Provider ID"
  type        = string
  default     = "github-provider"
}

variable "cicd_service_account_id" {
  description = "Service account ID for CI/CD"
  type        = string
  default     = "github-actions-cicd"
}

variable "terraform_state_bucket_name" {
  description = "GCS bucket name used by Terraform remote backend"
  type        = string
  default     = ""
}
