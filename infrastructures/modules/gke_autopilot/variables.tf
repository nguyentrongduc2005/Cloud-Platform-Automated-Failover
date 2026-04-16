variable "project_id" {
  description = "ID của GCP Project"
  type        = string
}

variable "cluster_name_prefix" {
  description = "Prefix tên GKE cluster"
  type        = string
}

variable "primary_region" {
  description = "Region chính cho cluster primary"
  type        = string
}

variable "failover_region" {
  description = "Region dự phòng cho cluster failover"
  type        = string
}

variable "network_name" {
  description = "Tên VPC dùng cho GKE"
  type        = string
}

variable "primary_subnetwork_name" {
  description = "Tên subnet primary"
  type        = string
}

variable "failover_subnetwork_name" {
  description = "Tên subnet failover"
  type        = string
}

variable "primary_pod_range_name" {
  description = "Secondary range cho Pod của primary cluster"
  type        = string
  default     = "primary-pod-range"
}

variable "primary_service_range_name" {
  description = "Secondary range cho Service của primary cluster"
  type        = string
  default     = "primary-service-range"
}

variable "failover_pod_range_name" {
  description = "Secondary range cho Pod của failover cluster"
  type        = string
  default     = "failover-pod-range"
}

variable "failover_service_range_name" {
  description = "Secondary range cho Service của failover cluster"
  type        = string
  default     = "failover-service-range"
}

variable "cluster_deletion_protection" {
  description = "Bật bảo vệ xóa GKE cluster"
  type        = bool
  default     = false
}

variable "release_channel" {
  description = "Release channel cho GKE Autopilot"
  type        = string
  default     = "REGULAR"

  validation {
    condition     = contains(["RAPID", "REGULAR", "STABLE"], var.release_channel)
    error_message = "release_channel phải là RAPID, REGULAR hoặc STABLE."
  }
}

variable "enable_failover_cluster" {
  description = "Bật/tắt tạo cụm GKE failover (cold standby khi false)"
  type        = bool
  default     = true
}

variable "k8s_namespace" {
  description = "Namespace dùng để tạo secret cấu hình ứng dụng"
  type        = string
  default     = "default"
}

variable "create_namespace" {
  description = "Bật/tắt tạo namespace nếu chưa tồn tại"
  type        = bool
  default     = false
}

variable "backend_secret_name" {
  description = "Tên Kubernetes Secret chứa biến môi trường backend"
  type        = string
  default     = "backend-env-secret"
}

variable "frontend_secret_name" {
  description = "Tên Kubernetes Secret chứa biến môi trường frontend"
  type        = string
  default     = "frontend-env-secret"
}

variable "backend_env_vars_primary" {
  description = "Map biến môi trường backend cho primary cluster"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "backend_env_vars_failover" {
  description = "Map biến môi trường backend cho failover cluster"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "frontend_env_vars_primary" {
  description = "Map biến môi trường frontend cho primary cluster"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "frontend_env_vars_failover" {
  description = "Map biến môi trường frontend cho failover cluster"
  type        = map(string)
  default     = {}
  sensitive   = true
}
