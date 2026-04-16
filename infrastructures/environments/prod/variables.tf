variable "project_id" {
  type        = string
  description = "ID của dự án Google Cloud"
}

variable "primary_region" {
  description = "Region chính (Active) triển khai hạ tầng"
  type        = string
  default     = "asia-southeast1" # Singapore
}

variable "secondary_region" {
  description = "Region dự phòng (Standby/Failover) triển khai hạ tầng"
  type        = string
  default     = "asia-east1" # Taiwan
}
variable "zone" {
  type = string
}
variable "db_password" {
  description = "Mật khẩu Admin cho Cloud SQL"
  type        = string
  sensitive   = true
}

variable "db_name_prefix" {
  description = "Prefix tên tài nguyên DB/Redis"
  type        = string
  default     = "apsas-prod"
}

variable "db_name" {
  description = "Tên database ứng dụng"
  type        = string
  default     = "cloud_failover_db"
}

variable "db_user" {
  description = "Tên user ứng dụng cho Cloud SQL"
  type        = string
  default     = "admin"
}

variable "primary_db_tier" {
  description = "Tier cho Cloud SQL Primary"
  type        = string
  default     = "db-custom-2-7680"
}

variable "replica_db_tier" {
  description = "Tier cho Cloud SQL Replica"
  type        = string
  default     = "db-custom-2-7680"
}

variable "db_deletion_protection" {
  description = "Bật bảo vệ xóa Cloud SQL instances"
  type        = bool
  default     = true
}

variable "cluster_name_prefix" {
  description = "Prefix tên GKE cluster"
  type        = string
  default     = "apsas-prod"
}

variable "cluster_deletion_protection" {
  description = "Bật bảo vệ xóa GKE cluster"
  type        = bool
  default     = true
}

variable "gke_release_channel" {
  description = "Release channel cho GKE Autopilot"
  type        = string
  default     = "REGULAR"

  validation {
    condition     = contains(["RAPID", "REGULAR", "STABLE"], var.gke_release_channel)
    error_message = "gke_release_channel phải là RAPID, REGULAR hoặc STABLE."
  }
}

variable "kafka_name_prefix" {
  description = "Prefix tên Kafka cluster"
  type        = string
  default     = "apsas-prod"
}

variable "kafka_vcpu_count" {
  description = "Số vCPU cho mỗi Kafka cluster"
  type        = number
  default     = 3
}

variable "kafka_memory_bytes" {
  description = "Dung lượng RAM (bytes) cho mỗi Kafka cluster"
  type        = number
  default     = 3221225472
}

variable "kafka_bootstrap_servers_primary" {
  description = "Kafka bootstrap servers cho backend primary (ví dụ host1:9092,host2:9092)"
  type        = string
  default     = ""
}

variable "kafka_bootstrap_servers_failover" {
  description = "Kafka bootstrap servers cho backend failover (ví dụ host1:9092,host2:9092)"
  type        = string
  default     = ""
}

variable "enable_failover_cluster" {
  description = "Bật/tắt tạo cluster GKE failover để tiết kiệm quota"
  type        = bool
  default     = false
}

variable "k8s_namespace" {
  description = "Namespace để lưu Secret cấu hình ứng dụng"
  type        = string
  default     = "default"
}

variable "create_k8s_namespace" {
  description = "Bật/tắt tạo namespace trên cluster nếu chưa tồn tại"
  type        = bool
  default     = false
}

variable "backend_secret_name" {
  description = "Tên Secret chứa biến môi trường backend"
  type        = string
  default     = "backend-env-secret"
}

variable "frontend_secret_name" {
  description = "Tên Secret chứa biến môi trường frontend"
  type        = string
  default     = "frontend-env-secret"
}

variable "backend_env_vars_primary" {
  description = "Biến môi trường backend cho primary cluster"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "backend_env_vars_failover" {
  description = "Biến môi trường backend cho failover cluster"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "frontend_env_vars_primary" {
  description = "Biến môi trường frontend cho primary cluster"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "frontend_env_vars_failover" {
  description = "Biến môi trường frontend cho failover cluster"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "mci_membership_name_prefix" {
  description = "Prefix tên membership trên GKE Hub"
  type        = string
  default     = "apsas-prod"
}

variable "mci_service_name" {
  description = "Tên MultiClusterService"
  type        = string
  default     = "apsas-backend-mcs"
}

variable "mci_ingress_name" {
  description = "Tên MultiClusterIngress"
  type        = string
  default     = "apsas-backend-mci"
}

variable "mci_backend_label_key" {
  description = "Label key của backend pods"
  type        = string
  default     = "app"
}

variable "mci_backend_label_value" {
  description = "Label value của backend pods"
  type        = string
  default     = "apsas-backend"
}

variable "mci_service_port" {
  description = "Port của MultiClusterService"
  type        = number
  default     = 80
}

variable "mci_target_port" {
  description = "Target port của backend pods"
  type        = number
  default     = 8080
}

variable "create_mci_k8s_resources" {
  description = "Bật ở phase 2 để tạo MultiClusterService/Ingress sau khi CRD đã sẵn sàng"
  type        = bool
  default     = false
}

variable "frontend_mci_service_name" {
  description = "Tên MultiClusterService cho frontend"
  type        = string
  default     = "apsas-frontend-mcs"
}

variable "frontend_mci_ingress_name" {
  description = "Tên MultiClusterIngress cho frontend"
  type        = string
  default     = "apsas-frontend-mci"
}

variable "frontend_mci_label_key" {
  description = "Label key của frontend pods"
  type        = string
  default     = "app"
}

variable "frontend_mci_label_value" {
  description = "Label value của frontend pods"
  type        = string
  default     = "apsas-frontend"
}

variable "frontend_mci_service_port" {
  description = "Port của frontend MultiClusterService"
  type        = number
  default     = 80
}

variable "frontend_mci_target_port" {
  description = "Target port của frontend pods"
  type        = number
  default     = 80
}

variable "create_frontend_mci_k8s_resources" {
  description = "Bật để tạo MultiClusterService/Ingress cho frontend"
  type        = bool
  default     = false
}

variable "backend_image" {
  description = "Backend container image"
  type        = string
  default     = "europe-west4-docker.pkg.dev/replace-project/apsas-apps/apsas-backend:latest"
}

variable "frontend_image" {
  description = "Frontend container image"
  type        = string
  default     = "europe-west4-docker.pkg.dev/replace-project/apsas-apps/apsas-frontend:latest"
}

variable "backend_app_name" {
  description = "Backend app name and label"
  type        = string
  default     = "apsas-backend"
}

variable "frontend_app_name" {
  description = "Frontend app name and label"
  type        = string
  default     = "apsas-frontend"
}

variable "artifact_registry_repo_id" {
  description = "Artifact Registry repository ID for container images"
  type        = string
  default     = "apsas-apps"
}

variable "github_repository" {
  description = "GitHub repository in owner/repo format"
  type        = string
  default     = "replace-owner/replace-repo"
}

variable "github_branch" {
  description = "GitHub branch allowed for CI/CD federation"
  type        = string
  default     = "main"
}

variable "workload_identity_pool_id" {
  description = "Workload Identity Pool ID for GitHub Actions"
  type        = string
  default     = "github-pool"
}

variable "workload_identity_provider_id" {
  description = "Workload Identity Provider ID for GitHub Actions"
  type        = string
  default     = "github-provider"
}

variable "cicd_service_account_id" {
  description = "Service account ID used by GitHub Actions"
  type        = string
  default     = "github-actions-cicd"
}

