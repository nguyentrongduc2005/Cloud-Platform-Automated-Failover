# 1. Tạo VPC (Chế độ Global cho Multi-region)
resource "google_compute_network" "vpc" {
  name                    = var.vpc_name
  project                 = var.project_id
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
}

# 2. Tạo Subnet cho Primary Region (Kèm Secondary Ranges cho GKE)
resource "google_compute_subnetwork" "primary_subnet" {
  name                     = "${var.vpc_name}-primary-subnet"
  project                  = var.project_id
  ip_cidr_range            = var.primary_subnet_cidr
  region                   = var.primary_region
  network                  = google_compute_network.vpc.id
  private_ip_google_access = true # Cho phép gọi GCP API không cần Public IP

  secondary_ip_range {
    range_name    = "primary-pod-range"
    ip_cidr_range = "10.10.0.0/16"
  }
  secondary_ip_range {
    range_name    = "primary-service-range"
    ip_cidr_range = "10.11.0.0/20"
  }
}

# 3. Tạo Subnet cho Failover Region
resource "google_compute_subnetwork" "failover_subnet" {
  name                     = "${var.vpc_name}-failover-subnet"
  project                  = var.project_id
  ip_cidr_range            = var.failover_subnet_cidr
  region                   = var.failover_region
  network                  = google_compute_network.vpc.id
  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "failover-pod-range"
    ip_cidr_range = "10.20.0.0/16"
  }
  secondary_ip_range {
    range_name    = "failover-service-range"
    ip_cidr_range = "10.21.0.0/20"
  }
}

# 4. Cloud Router & NAT cho Primary Region (Để Pods kết nối Internet ra ngoài)
resource "google_compute_router" "primary_router" {
  name    = "${var.vpc_name}-primary-router"
  region  = var.primary_region
  network = google_compute_network.vpc.id
  project = var.project_id
}

resource "google_compute_router_nat" "primary_nat" {
  name                               = "${var.vpc_name}-primary-nat"
  router                             = google_compute_router.primary_router.name
  region                             = var.primary_region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  project                            = var.project_id
}

# 5. Cloud Router & NAT cho Failover Region
resource "google_compute_router" "failover_router" {
  name    = "${var.vpc_name}-failover-router"
  region  = var.failover_region
  network = google_compute_network.vpc.id
  project = var.project_id
}

resource "google_compute_router_nat" "failover_nat" {
  name                               = "${var.vpc_name}-failover-nat"
  router                             = google_compute_router.failover_router.name
  region                             = var.failover_region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  project                            = var.project_id
}
