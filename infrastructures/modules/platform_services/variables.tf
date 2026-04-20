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
