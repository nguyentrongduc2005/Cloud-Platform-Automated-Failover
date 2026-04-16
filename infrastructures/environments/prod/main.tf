
# Bắt buộc phải có đoạn này trong thư mục prod/main.tf
module "networking" {
  source               = "../../modules/networking" # Đường dẫn trỏ ngược về thư mục module
  project_id           = var.project_id
  vpc_name             = "main-failover-vpc"
  primary_region       = var.primary_region
  failover_region      = var.secondary_region
  primary_subnet_cidr  = "10.0.0.0/24"
  failover_subnet_cidr = "10.1.0.0/24"
}

module "database" {
  source     = "../../modules/database"
  project_id = var.project_id
  # Truyền network_id từ output của module networking sang
  network_id = module.networking.network_id

  primary_region  = var.primary_region
  failover_region = var.secondary_region

  name_prefix         = var.db_name_prefix
  db_name             = var.db_name
  db_user             = var.db_user
  primary_db_tier     = var.primary_db_tier
  replica_db_tier     = var.replica_db_tier
  deletion_protection = var.db_deletion_protection

  # Lấy mật khẩu từ biến môi trường (Sẽ hướng dẫn truyền vào ở bước dưới)
  db_password = var.db_password
}

locals {
  backend_env_vars_primary = merge(
    var.backend_env_vars_primary,
    var.kafka_bootstrap_servers_primary != "" ? { KAFKA = var.kafka_bootstrap_servers_primary } : {}
  )

  backend_env_vars_failover = merge(
    var.backend_env_vars_failover,
    var.kafka_bootstrap_servers_failover != "" ? { KAFKA = var.kafka_bootstrap_servers_failover } : {}
  )
}

module "gke_autopilot" {
  source = "../../modules/gke_autopilot"

  project_id               = var.project_id
  cluster_name_prefix      = var.cluster_name_prefix
  primary_region           = var.primary_region
  failover_region          = var.secondary_region
  network_name             = module.networking.network_name
  primary_subnetwork_name  = module.networking.primary_subnetwork_name
  failover_subnetwork_name = module.networking.failover_subnetwork_name

  cluster_deletion_protection = var.cluster_deletion_protection
  release_channel             = var.gke_release_channel
  enable_failover_cluster     = var.enable_failover_cluster

  k8s_namespace              = var.k8s_namespace
  create_namespace           = var.create_k8s_namespace
  backend_secret_name        = var.backend_secret_name
  frontend_secret_name       = var.frontend_secret_name
  backend_env_vars_primary   = local.backend_env_vars_primary
  backend_env_vars_failover  = local.backend_env_vars_failover
  frontend_env_vars_primary  = var.frontend_env_vars_primary
  frontend_env_vars_failover = var.frontend_env_vars_failover
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

module "multicluster_ingress" {
  source = "../../modules/multicluster_ingress"

  project_id                     = var.project_id
  membership_name_prefix         = var.mci_membership_name_prefix
  primary_cluster_name           = module.gke_autopilot.primary_cluster_name
  primary_cluster_location       = module.gke_autopilot.primary_cluster_location
  primary_cluster_endpoint       = module.gke_autopilot.primary_cluster_endpoint
  primary_cluster_ca_certificate = module.gke_autopilot.primary_cluster_ca_certificate

  failover_cluster_name     = module.gke_autopilot.failover_cluster_name
  failover_cluster_location = module.gke_autopilot.failover_cluster_location
  enable_failover_cluster   = var.enable_failover_cluster

  k8s_namespace            = var.k8s_namespace
  mci_service_name         = var.mci_service_name
  mci_ingress_name         = var.mci_ingress_name
  mci_backend_label_key    = var.mci_backend_label_key
  mci_backend_label_value  = var.mci_backend_label_value
  mci_service_port         = var.mci_service_port
  mci_target_port          = var.mci_target_port
  create_mci_k8s_resources = var.create_mci_k8s_resources

  frontend_mci_service_name         = var.frontend_mci_service_name
  frontend_mci_ingress_name         = var.frontend_mci_ingress_name
  frontend_mci_label_key            = var.frontend_mci_label_key
  frontend_mci_label_value          = var.frontend_mci_label_value
  frontend_mci_service_port         = var.frontend_mci_service_port
  frontend_mci_target_port          = var.frontend_mci_target_port
  create_frontend_mci_k8s_resources = var.create_frontend_mci_k8s_resources
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
}

resource "google_dns_managed_zone" "frontend" {
  count = var.enable_frontend_dns && var.create_frontend_dns_zone ? 1 : 0

  project     = var.project_id
  name        = var.frontend_dns_zone_name
  dns_name    = var.frontend_dns_domain
  description = "Public DNS zone for frontend"
}

resource "google_dns_record_set" "frontend_a" {
  count = var.enable_frontend_dns ? 1 : 0

  project      = var.project_id
  name         = var.frontend_dns_record_name
  managed_zone = var.create_frontend_dns_zone ? google_dns_managed_zone.frontend[0].name : var.frontend_dns_zone_name
  type         = "A"
  ttl          = var.frontend_dns_ttl
  rrdatas      = [var.frontend_domain_target_ip]

  lifecycle {
    precondition {
      condition     = var.frontend_domain_target_ip != ""
      error_message = "frontend_domain_target_ip must be set when enable_frontend_dns=true"
    }
  }
}
