variable "project_id" {
  description = "ID của GCP Project"
  type        = string
}

variable "network_id" {
  description = "ID của VPC Network (Lấy từ module networking)"
  type        = string
}

variable "primary_region" {
  description = "Khu vực chính (Ví dụ: asia-southeast1)"
  type        = string
}

variable "failover_region" {
  description = "Khu vực dự phòng (Ví dụ: asia-east1)"
  type        = string
}

variable "name_prefix" {
  description = "Prefix cho tên tài nguyên DB/Redis"
  type        = string
  default     = "apsas"
}

variable "db_name" {
  description = "Tên logical database trong Cloud SQL"
  type        = string
  default     = "cloud_failover_db"
}

variable "db_user" {
  description = "Tên user ứng dụng dùng để kết nối MySQL"
  type        = string
  default     = "admin"
}

variable "primary_db_tier" {
  description = "Machine tier cho Cloud SQL primary"
  type        = string
  default     = "db-custom-2-7680"
}

variable "replica_db_tier" {
  description = "Machine tier cho Cloud SQL replica"
  type        = string
  default     = "db-custom-2-7680"
}

variable "backup_start_time" {
  description = "Thời gian backup UTC theo định dạng HH:MM"
  type        = string
  default     = "18:00"
}

variable "transaction_log_retention_days" {
  description = "Số ngày lưu transaction log cho PITR"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Bật bảo vệ xóa cho Cloud SQL instance"
  type        = bool
  default     = false
}

variable "redis_memory_size_gb" {
  description = "Dung lượng Redis cho mỗi vùng (GB)"
  type        = number
  default     = 1
}

variable "db_password" {
  description = "Mật khẩu cho user ứng dụng của Cloud SQL"
  type        = string
  sensitive   = true
}
