variable "project_id" {
  description = "ID của GCP Project"
  type        = string
}

variable "vpc_name" {
  description = "Tên của VPC"
  type        = string
  default     = "failover-vpc"
}

variable "primary_region" {
  description = "Khu vực chính (Ví dụ: asia-southeast1)"
  type        = string
}

variable "failover_region" {
  description = "Khu vực dự phòng (Ví dụ: asia-east1)"
  type        = string
}

variable "primary_subnet_cidr" {
  description = "CIDR block cho subnet chính"
  type        = string
  default     = "10.0.0.0/24"
}

variable "failover_subnet_cidr" {
  description = "CIDR block cho subnet dự phòng"
  type        = string
  default     = "10.1.0.0/24"
}
