variable "project_id" {
  type = string
}

variable "primary_region" {
  type    = string
  default = "europe-west4"
}

variable "secondary_region" {
  type    = string
  default = "asia-east1"
}

variable "vpc_name" {
  type    = string
  default = "main-failover-vpc"
}

variable "primary_subnet_cidr" {
  type    = string
  default = "10.0.0.0/24"
}

variable "failover_subnet_cidr" {
  type    = string
  default = "10.1.0.0/24"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_name_prefix" {
  type    = string
  default = "apsas-prod"
}

variable "db_name" {
  type    = string
  default = "cloud_failover_db"
}

variable "db_user" {
  type    = string
  default = "admin"
}

variable "primary_db_tier" {
  type    = string
  default = "db-custom-2-7680"
}

variable "replica_db_tier" {
  type    = string
  default = "db-custom-2-7680"
}

variable "backup_start_time" {
  type    = string
  default = "18:00"
}

variable "transaction_log_retention_days" {
  type    = number
  default = 7
}

variable "db_deletion_protection" {
  type    = bool
  default = true
}

variable "redis_memory_size_gb" {
  type    = number
  default = 1
}

variable "redis_port" {
  type    = number
  default = 6379
}

variable "kafka_name_prefix" {
  type    = string
  default = "apsas-prod"
}

variable "kafka_vcpu_count" {
  type    = number
  default = 3
}

variable "kafka_memory_bytes" {
  type    = number
  default = 3221225472
}

variable "kafka_bootstrap_servers_primary" {
  type    = string
  default = ""
}

variable "kafka_bootstrap_servers_failover" {
  type    = string
  default = ""
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

variable "primary_vpc_connector_name" {
  type    = string
  default = "apsas-pri-conn"
}

variable "secondary_vpc_connector_name" {
  type    = string
  default = "apsas-fail-conn"
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

variable "lb_name_prefix" {
  type    = string
  default = "apsas"
}

variable "enable_failover_traffic" {
  type    = bool
  default = false
}

variable "db_seed_bucket_name" {
  type    = string
  default = "store-script-db"
}

variable "db_seed_import_uris" {
  type    = list(string)
  default = ["gs://store-script-db/apsas.sql", "gs://store-script-db/grant_permissions.sql"]
}

variable "enable_db_seed_import" {
  type    = bool
  default = false
}

variable "artifact_registry_repo_id" {
  type    = string
  default = "apsas-apps"
}

variable "github_repository" {
  type = string
}

variable "github_branch" {
  type    = string
  default = "main"
}

variable "workload_identity_pool_id" {
  type    = string
  default = "github-pool"
}

variable "workload_identity_provider_id" {
  type    = string
  default = "github-provider"
}

variable "cicd_service_account_id" {
  type    = string
  default = "github-actions-cicd"
}

variable "terraform_state_bucket_name" {
  type    = string
  default = "apsas-tf-state-prod-bucket"
}
