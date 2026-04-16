variable "project_id" {
  description = "ID của GCP Project"
  type        = string
}

variable "name_prefix" {
  description = "Prefix tên Kafka cluster"
  type        = string
}

variable "primary_region" {
  description = "Region chính cho Kafka"
  type        = string
}

variable "failover_region" {
  description = "Region dự phòng cho Kafka"
  type        = string
}

variable "primary_subnetwork_name" {
  description = "Tên subnet primary để Kafka gắn private networking"
  type        = string
}

variable "failover_subnetwork_name" {
  description = "Tên subnet failover để Kafka gắn private networking"
  type        = string
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
