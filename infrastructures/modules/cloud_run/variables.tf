variable "project_id" {
  type = string
}

variable "primary_region" {
  type = string
}

variable "secondary_region" {
  type = string
}

variable "network_name" {
  type = string
}

variable "backend_service_name" {
  type    = string
  default = "apsas-backend"
}

variable "frontend_service_name" {
  type    = string
  default = "apsas-frontend"
}

variable "runtime_service_account_id" {
  type    = string
  default = "apsas-runtime"
}

variable "backend_image" {
  type = string
}

variable "frontend_image" {
  type = string
}

variable "backend_env_vars_primary" {
  type      = map(string)
  default   = {}
  sensitive = true
}

variable "backend_env_vars_failover" {
  type      = map(string)
  default   = {}
  sensitive = true
}

variable "frontend_env_vars_primary" {
  type      = map(string)
  default   = {}
  sensitive = true
}

variable "frontend_env_vars_failover" {
  type      = map(string)
  default   = {}
  sensitive = true
}

variable "primary_vpc_connector_name" {
  type    = string
  default = "apsas-cr-primary-connector"
}

variable "secondary_vpc_connector_name" {
  type    = string
  default = "apsas-cr-failover-connector"
}

variable "primary_vpc_connector_cidr" {
  type    = string
  default = "10.8.0.0/28"
}

variable "secondary_vpc_connector_cidr" {
  type    = string
  default = "10.9.0.0/28"
}

variable "vpc_connector_min_instances" {
  type    = number
  default = 2
}

variable "vpc_connector_max_instances" {
  type    = number
  default = 3
}

variable "cloud_run_deletion_protection" {
  type    = bool
  default = false
}

variable "allow_unauthenticated_invoker" {
  type    = bool
  default = true
}

variable "backend_min_instances_primary" {
  type    = number
  default = 1
}

variable "backend_max_instances_primary" {
  type    = number
  default = 20
}

variable "backend_min_instances_failover" {
  type    = number
  default = 0
}

variable "backend_max_instances_failover" {
  type    = number
  default = 20
}

variable "frontend_min_instances_primary" {
  type    = number
  default = 1
}

variable "frontend_max_instances_primary" {
  type    = number
  default = 20
}

variable "frontend_min_instances_failover" {
  type    = number
  default = 0
}

variable "frontend_max_instances_failover" {
  type    = number
  default = 20
}
