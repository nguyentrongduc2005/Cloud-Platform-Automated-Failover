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
