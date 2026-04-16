variable "primary_cluster_endpoint" {
  description = "Primary GKE cluster endpoint"
  type        = string
}

variable "primary_cluster_ca_certificate" {
  description = "Primary GKE cluster CA certificate"
  type        = string
  sensitive   = true
}

variable "failover_cluster_endpoint" {
  description = "Failover GKE cluster endpoint"
  type        = string
  default     = null
}

variable "failover_cluster_ca_certificate" {
  description = "Failover GKE cluster CA certificate"
  type        = string
  default     = null
  sensitive   = true
}

variable "enable_failover_cluster" {
  description = "Enable failover cluster resources"
  type        = bool
  default     = true
}

variable "k8s_namespace" {
  description = "Namespace for workloads"
  type        = string
  default     = "default"
}

variable "backend_secret_name" {
  description = "Kubernetes Secret name for backend env vars"
  type        = string
}

variable "frontend_secret_name" {
  description = "Kubernetes Secret name for frontend env vars"
  type        = string
}

variable "backend_image" {
  description = "Backend container image"
  type        = string
}

variable "frontend_image" {
  description = "Frontend container image"
  type        = string
}

variable "backend_app_name" {
  description = "Backend app label and resource base name"
  type        = string
  default     = "apsas-backend"
}

variable "frontend_app_name" {
  description = "Frontend app label and resource base name"
  type        = string
  default     = "apsas-frontend"
}

variable "backend_replicas_primary" {
  description = "Number of backend replicas in primary cluster"
  type        = number
  default     = 2
}

variable "backend_replicas_failover" {
  description = "Number of backend replicas in failover cluster"
  type        = number
  default     = 2
}

variable "frontend_replicas_primary" {
  description = "Number of frontend replicas in primary cluster"
  type        = number
  default     = 2
}

variable "frontend_replicas_failover" {
  description = "Number of frontend replicas in failover cluster"
  type        = number
  default     = 2
}
