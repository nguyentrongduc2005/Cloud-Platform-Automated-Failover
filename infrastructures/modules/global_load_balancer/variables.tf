variable "project_id" {
  type = string
}

variable "name_prefix" {
  type    = string
  default = "apsas"
}

variable "primary_region" {
  type = string
}

variable "secondary_region" {
  type = string
}

variable "backend_primary_service_name" {
  type = string
}

variable "backend_failover_service_name" {
  type = string
}

variable "frontend_primary_service_name" {
  type = string
}

variable "frontend_failover_service_name" {
  type = string
}

variable "enable_failover_backends" {
  type    = bool
  default = false
}

variable "backend_primary_weight" {
  type    = number
  default = 1000
}

variable "backend_failover_weight" {
  type    = number
  default = 10
}

variable "frontend_primary_weight" {
  type    = number
  default = 1000
}

variable "frontend_failover_weight" {
  type    = number
  default = 10
}
