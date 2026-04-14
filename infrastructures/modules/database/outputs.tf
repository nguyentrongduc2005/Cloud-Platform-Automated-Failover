output "primary_db_private_ip" {
  value = google_sql_database_instance.primary_db.private_ip_address
}

output "primary_db_instance_name" {
  value = google_sql_database_instance.primary_db.name
}

output "replica_db_private_ip" {
  value = google_sql_database_instance.replica_db.private_ip_address
}

output "replica_db_instance_name" {
  value = google_sql_database_instance.replica_db.name
}

output "database_name" {
  value = google_sql_database.app_db.name
}

output "database_user" {
  value = google_sql_user.users.name
}

output "primary_redis_ip" {
  value = google_redis_instance.primary_redis.host
}

output "failover_redis_ip" {
  value = google_redis_instance.failover_redis.host
}
