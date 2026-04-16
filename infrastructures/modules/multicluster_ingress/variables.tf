variable "project_id" {
  description = "ID của GCP Project"
  type        = string
}

variable "membership_name_prefix" {
  description = "Prefix membership name trên GKE Hub"
  type        = string
  default     = "apsas"
}

variable "primary_cluster_name" {
  description = "Tên cluster primary"
  type        = string
}

variable "primary_cluster_location" {
  description = "Location cluster primary"
  type        = string
}

variable "primary_cluster_endpoint" {
  description = "Endpoint cluster primary"
  type        = string
}

variable "primary_cluster_ca_certificate" {
  description = "CA certificate (base64) của cluster primary"
  type        = string
  sensitive   = true
}

variable "failover_cluster_name" {
  description = "Tên cluster failover"
  type        = string
  default     = null
}

variable "failover_cluster_location" {
  description = "Location cluster failover"
  type        = string
  default     = null
}

variable "enable_failover_cluster" {
  description = "Bật/tắt failover cluster"
  type        = bool
  default     = true
}

variable "k8s_namespace" {
  description = "Namespace deploy MultiClusterService/Ingress"
  type        = string
  default     = "default"
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
  description = "Label key để chọn backend pods"
  type        = string
  default     = "app"
}

variable "mci_backend_label_value" {
  description = "Label value để chọn backend pods"
  type        = string
  default     = "apsas-backend"
}

variable "mci_service_port" {
  description = "Service port exposed by MultiClusterService"
  type        = number
  default     = 80
}

variable "mci_target_port" {
  description = "Target port on backend pods"
  type        = number
  default     = 8080
}

variable "create_mci_k8s_resources" {
  description = "Bật sau khi MCI CRD đã sẵn sàng để tạo MultiClusterService/Ingress"
  type        = bool
  default     = false
}
