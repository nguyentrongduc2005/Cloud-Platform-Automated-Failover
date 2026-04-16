output "primary_kafka_cluster_id" {
  value = google_managed_kafka_cluster.primary.cluster_id
}

output "primary_kafka_cluster_name" {
  value = google_managed_kafka_cluster.primary.name
}

output "primary_kafka_cluster_state" {
  value = google_managed_kafka_cluster.primary.state
}

output "failover_kafka_cluster_id" {
  value = google_managed_kafka_cluster.failover.cluster_id
}

output "failover_kafka_cluster_name" {
  value = google_managed_kafka_cluster.failover.name
}

output "failover_kafka_cluster_state" {
  value = google_managed_kafka_cluster.failover.state
}
