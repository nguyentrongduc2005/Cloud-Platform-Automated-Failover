terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
    google-beta = {
      source = "hashicorp/google-beta"
    }
  }
}

resource "google_managed_kafka_cluster" "primary" {
  provider   = google-beta
  cluster_id = "${var.name_prefix}-primary-kafka"
  project    = var.project_id
  location   = var.primary_region

  capacity_config {
    vcpu_count   = var.kafka_vcpu_count
    memory_bytes = var.kafka_memory_bytes
  }

  gcp_config {
    access_config {
      network_configs {
        subnet = "projects/${var.project_id}/regions/${var.primary_region}/subnetworks/${var.primary_subnetwork_name}"
      }
    }
  }
}

resource "google_managed_kafka_cluster" "failover" {
  provider   = google-beta
  cluster_id = "${var.name_prefix}-failover-kafka"
  project    = var.project_id
  location   = var.failover_region


  capacity_config {
    vcpu_count   = var.kafka_vcpu_count
    memory_bytes = var.kafka_memory_bytes
  }

  gcp_config {
    access_config {
      network_configs {
        subnet = "projects/${var.project_id}/regions/${var.failover_region}/subnetworks/${var.failover_subnetwork_name}"
      }
    }
  }
}
