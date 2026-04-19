variable "project_id" {
  type = string
}

variable "global_lb_ip" {
  type = string
}

variable "backend_service_name" {
  type = string
}

variable "frontend_service_name" {
  type = string
}

variable "alert_email_addresses" {
  type    = list(string)
  default = []
}
