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
