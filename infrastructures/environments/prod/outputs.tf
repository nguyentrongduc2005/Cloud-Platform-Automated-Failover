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

output "backend_primary_cloud_run" {
  value = module.cloud_run.backend_primary_url
}

output "backend_failover_cloud_run" {
  value = module.cloud_run.backend_failover_url
}

output "frontend_primary_cloud_run" {
  value = module.cloud_run.frontend_primary_url
}

output "frontend_failover_cloud_run" {
  value = module.cloud_run.frontend_failover_url
}

output "global_lb_ip" {
  value = module.global_load_balancer.global_ip
}

output "frontend_entrypoint" {
  value = module.global_load_balancer.frontend_url
}

output "backend_entrypoint" {
  value = module.global_load_balancer.api_url
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

output "monitoring_uptime_backend_check_id" {
  value = module.monitoring.uptime_backend_check_id
}

output "monitoring_uptime_frontend_check_id" {
  value = module.monitoring.uptime_frontend_check_id
}

output "logging_metric_backend_error_count" {
  value = module.monitoring.backend_error_metric_name
}

output "logging_metric_frontend_error_count" {
  value = module.monitoring.frontend_error_metric_name
}
