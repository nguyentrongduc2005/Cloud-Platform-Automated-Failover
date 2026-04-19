module "networking" {
  source               = "../../modules/networking"
  project_id           = var.project_id
  vpc_name             = var.vpc_name
  primary_region       = var.primary_region
  failover_region      = var.secondary_region
  primary_subnet_cidr  = var.primary_subnet_cidr
  failover_subnet_cidr = var.failover_subnet_cidr
}

module "database" {
  source     = "../../modules/database"
  project_id = var.project_id
  network_id = module.networking.network_id

  primary_region                 = var.primary_region
  failover_region                = var.secondary_region
  name_prefix                    = var.db_name_prefix
  db_name                        = var.db_name
  db_user                        = var.db_user
  primary_db_tier                = var.primary_db_tier
  replica_db_tier                = var.replica_db_tier
  deletion_protection            = var.db_deletion_protection
  backup_start_time              = var.backup_start_time
  transaction_log_retention_days = var.transaction_log_retention_days
  redis_memory_size_gb           = var.redis_memory_size_gb
  db_password                    = var.db_password
}

module "kafka" {
  source = "../../modules/kafka"

  project_id               = var.project_id
  name_prefix              = var.kafka_name_prefix
  primary_region           = var.primary_region
  failover_region          = var.secondary_region
  primary_subnetwork_name  = module.networking.primary_subnetwork_name
  failover_subnetwork_name = module.networking.failover_subnetwork_name
  kafka_vcpu_count         = var.kafka_vcpu_count
  kafka_memory_bytes       = var.kafka_memory_bytes
}

locals {
  backend_env_vars_primary = merge(
    var.backend_env_vars_primary,
    {
      MYSQL      = format("jdbc:mysql://%s:3306/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC", module.database.primary_db_private_ip, var.db_name)
      USER       = var.db_user
      PASS       = var.db_password
      REDIS_HOST = module.database.primary_redis_ip
      REDIS_PORT = tostring(var.redis_port)
    },
    var.kafka_bootstrap_servers_primary != "" ? { KAFKA = var.kafka_bootstrap_servers_primary } : {}
  )

  backend_env_vars_failover = merge(
    var.backend_env_vars_failover,
    {
      MYSQL            = format("jdbc:mysql://%s:3306/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC", module.database.replica_db_private_ip, var.db_name)
      USER             = var.db_user
      PASS             = var.db_password
      REDIS_HOST       = module.database.failover_redis_ip
      REDIS_PORT       = tostring(var.redis_port)
      APP_SEED_ENABLED = "false"
    },
    var.kafka_bootstrap_servers_failover != "" ? { KAFKA = var.kafka_bootstrap_servers_failover } : {}
  )
}

module "security_and_ci" {
  source = "../../modules/security_and_ci"

  project_id                    = var.project_id
  region                        = var.primary_region
  artifact_registry_repo_id     = var.artifact_registry_repo_id
  github_repository             = var.github_repository
  github_branch                 = var.github_branch
  workload_identity_pool_id     = var.workload_identity_pool_id
  workload_identity_provider_id = var.workload_identity_provider_id
  cicd_service_account_id       = var.cicd_service_account_id
  terraform_state_bucket_name   = var.terraform_state_bucket_name
}

module "cloud_run" {
  source = "../../modules/cloud_run"

  project_id                 = var.project_id
  primary_region             = var.primary_region
  secondary_region           = var.secondary_region
  network_name               = module.networking.network_name
  backend_service_name       = var.backend_service_name
  frontend_service_name      = var.frontend_service_name
  runtime_service_account_id = var.runtime_service_account_id

  backend_image  = var.backend_image
  frontend_image = var.frontend_image

  backend_env_vars_primary   = local.backend_env_vars_primary
  backend_env_vars_failover  = local.backend_env_vars_failover
  frontend_env_vars_primary  = var.frontend_env_vars_primary
  frontend_env_vars_failover = var.frontend_env_vars_failover

  primary_vpc_connector_name    = var.primary_vpc_connector_name
  secondary_vpc_connector_name  = var.secondary_vpc_connector_name
  primary_vpc_connector_cidr    = var.primary_vpc_connector_cidr
  secondary_vpc_connector_cidr  = var.secondary_vpc_connector_cidr
  vpc_connector_min_instances   = var.vpc_connector_min_instances
  vpc_connector_max_instances   = var.vpc_connector_max_instances
  cloud_run_deletion_protection = var.cloud_run_deletion_protection
  allow_unauthenticated_invoker = var.allow_unauthenticated_invoker

  backend_min_instances_primary  = var.backend_min_instances_primary
  backend_max_instances_primary  = var.backend_max_instances_primary
  backend_min_instances_failover = var.backend_min_instances_failover
  backend_max_instances_failover = var.backend_max_instances_failover

  frontend_min_instances_primary  = var.frontend_min_instances_primary
  frontend_max_instances_primary  = var.frontend_max_instances_primary
  frontend_min_instances_failover = var.frontend_min_instances_failover
  frontend_max_instances_failover = var.frontend_max_instances_failover
}

module "global_load_balancer" {
  source = "../../modules/global_load_balancer"

  project_id       = var.project_id
  name_prefix      = var.lb_name_prefix
  primary_region   = var.primary_region
  secondary_region = var.secondary_region

  backend_primary_service_name   = module.cloud_run.backend_primary_name
  backend_failover_service_name  = module.cloud_run.backend_failover_name
  frontend_primary_service_name  = module.cloud_run.frontend_primary_name
  frontend_failover_service_name = module.cloud_run.frontend_failover_name

  enable_failover_backends = var.enable_failover_traffic
}

module "monitoring" {
  source = "../../modules/monitoring"

  project_id            = var.project_id
  global_lb_ip          = module.global_load_balancer.global_ip
  backend_service_name  = var.backend_service_name
  frontend_service_name = var.frontend_service_name
  alert_email_addresses = var.alert_email_addresses
}

data "google_project" "current" {
  project_id = var.project_id
}

resource "google_storage_bucket_iam_member" "cloudsql_import_reader" {
  count  = var.enable_db_seed_import ? 1 : 0
  bucket = var.db_seed_bucket_name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:service-${data.google_project.current.number}@gcp-sa-cloud-sql.iam.gserviceaccount.com"
}

resource "null_resource" "db_seed_import" {
  count = var.enable_db_seed_import ? 1 : 0

  triggers = {
    instance = module.database.primary_db_instance_name
    database = module.database.database_name
    uris     = sha1(join(",", var.db_seed_import_uris))
  }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-lc"]
    command     = <<EOC
set -euo pipefail
for uri in ${join(" ", var.db_seed_import_uris)}; do
  gcloud sql import sql "${module.database.primary_db_instance_name}" "$uri" \
    --database="${module.database.database_name}" \
    --project="${var.project_id}" \
    --quiet || true
done
EOC
  }

  depends_on = [
    module.database,
    google_storage_bucket_iam_member.cloudsql_import_reader
  ]
}

