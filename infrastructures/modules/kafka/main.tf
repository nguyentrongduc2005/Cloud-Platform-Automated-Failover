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

data "google_compute_subnetwork" "primary" {
  project = var.project_id
  name    = var.primary_subnetwork_name
  region  = var.primary_region
}

data "google_compute_subnetwork" "failover" {
  project = var.project_id
  name    = var.failover_subnetwork_name
  region  = var.failover_region
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
        subnet = data.google_compute_subnetwork.primary.id
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
        subnet = data.google_compute_subnetwork.failover.id
      }
    }
  }
}
