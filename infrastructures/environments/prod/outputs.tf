
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
