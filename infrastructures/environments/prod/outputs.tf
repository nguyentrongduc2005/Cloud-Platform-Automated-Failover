
output "primary_db_instance_name" {
  value = module.database.primary_db_instance_name
}

output "primary_db_private_ip" {
  value = module.database.primary_db_private_ip
}

output "replica_db_instance_name" {
  value = module.database.replica_db_instance_name
}

output "replica_db_private_ip" {
  value = module.database.replica_db_private_ip
}

output "database_name" {
  value = module.database.database_name
}

output "database_user" {
  value = module.database.database_user
}

output "primary_redis_ip" {
  value = module.database.primary_redis_ip
}

output "failover_redis_ip" {
  value = module.database.failover_redis_ip
}

output "primary_gke_cluster_name" {
  value = module.gke_autopilot.primary_cluster_name
}

output "primary_gke_cluster_endpoint" {
  value = module.gke_autopilot.primary_cluster_endpoint
}

output "failover_gke_cluster_name" {
  value = module.gke_autopilot.failover_cluster_name
}

output "failover_gke_cluster_endpoint" {
  value = module.gke_autopilot.failover_cluster_endpoint
}

output "primary_kafka_cluster_id" {
  value = module.kafka.primary_kafka_cluster_id
}

output "primary_kafka_cluster_name" {
  value = module.kafka.primary_kafka_cluster_name
}

output "failover_kafka_cluster_id" {
  value = module.kafka.failover_kafka_cluster_id
}

output "failover_kafka_cluster_name" {
  value = module.kafka.failover_kafka_cluster_name
}

output "mci_primary_membership_id" {
  value = module.multicluster_ingress.primary_membership_id
}

output "mci_failover_membership_id" {
  value = module.multicluster_ingress.failover_membership_id
}

output "mci_name" {
  value = module.multicluster_ingress.mci_name
}

output "mcs_name" {
  value = module.multicluster_ingress.mcs_name
}

output "mci_status" {
  value = module.multicluster_ingress.mci_status
}

output "backend_service_name" {
  value = module.workloads.backend_service_name
}

output "frontend_service_name" {
  value = module.workloads.frontend_service_name
}

output "artifact_registry_repository" {
  value = module.security_and_ci.artifact_registry_repository
}

output "artifact_registry_repository_url" {
  value = module.security_and_ci.artifact_registry_repository_url
}

output "cicd_service_account_email" {
  value = module.security_and_ci.cicd_service_account_email
}

output "github_workload_identity_provider" {
  value = module.security_and_ci.github_workload_identity_provider
}
