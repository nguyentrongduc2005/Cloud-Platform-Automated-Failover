# ==============================================================================
# 1. PRIVATE SERVICES ACCESS (KẾT NỐI MẠNG RIÊNG)
# ==============================================================================
resource "google_compute_global_address" "private_ip_address" {
  name          = "${var.name_prefix}-google-managed-services-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = var.network_id
  project       = var.project_id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = var.network_id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# ==============================================================================
# 2. MYSQL PRIMARY (ASIA-SOUTHEAST1) - CÓ CẤU HÌNH BACKUP
# ==============================================================================
resource "google_sql_database_instance" "primary_db" {
  name             = "${var.name_prefix}-primary-mysql"
  database_version = "MYSQL_8_0"
  region           = var.primary_region
  project          = var.project_id

  depends_on = [google_service_networking_connection.private_vpc_connection]

  settings {
    tier              = var.primary_db_tier
    availability_type = "REGIONAL"

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }

    # CẤU HÌNH SAO LƯU & ĐỒNG BỘ NÂNG CAO
    backup_configuration {
      enabled                        = true
      binary_log_enabled             = true
      start_time                     = var.backup_start_time
      transaction_log_retention_days = var.transaction_log_retention_days
    }
  }

  deletion_protection = var.deletion_protection
}

# TẠO LOGICAL DATABASE CHO SPRING BOOT
resource "google_sql_database" "app_db" {
  name      = var.db_name
  instance  = google_sql_database_instance.primary_db.name
  project   = var.project_id
  charset   = "utf8mb4"
  collation = "utf8mb4_unicode_ci"
}

# TẠO USER MYSQL
resource "google_sql_user" "users" {
  name     = var.db_user
  instance = google_sql_database_instance.primary_db.name
  password = var.db_password
  project  = var.project_id
  host     = "%"
}

# ==============================================================================
# 3. MYSQL REPLICA (ASIA-EAST1) - CHUẨN BỊ CHO PROMOTION
# ==============================================================================
resource "google_sql_database_instance" "replica_db" {
  name             = "${var.name_prefix}-failover-mysql-replica"
  database_version = "MYSQL_8_0"
  region           = var.failover_region
  project          = var.project_id

  master_instance_name = google_sql_database_instance.primary_db.name
  depends_on           = [google_service_networking_connection.private_vpc_connection]
  settings {
    tier              = var.replica_db_tier
    availability_type = "ZONAL"

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }
  }

  deletion_protection = var.deletion_protection

  # (PROMOTION) KHỐI LỆNH BẢO VỆ LIFECYCLE
  lifecycle {
    # Khi sự cố xảy ra và bạn thăng cấp Replica thành Primary, 
    # Terraform sẽ bỏ qua việc kiểm tra trường "master_instance_name", 
    # giúp lệnh terraform apply sau này không vô tình phá hỏng DB mới của bạn.
    ignore_changes = [master_instance_name]
  }
}

# ==============================================================================
# 4. REDIS CACHE (GIỮ NGUYÊN)
# ==============================================================================
resource "google_redis_instance" "primary_redis" {
  name               = "${var.name_prefix}-primary-redis"
  memory_size_gb     = var.redis_memory_size_gb
  region             = var.primary_region
  project            = var.project_id
  authorized_network = var.network_id
  depends_on         = [google_service_networking_connection.private_vpc_connection]
}

resource "google_redis_instance" "failover_redis" {
  name               = "${var.name_prefix}-failover-redis"
  memory_size_gb     = var.redis_memory_size_gb
  region             = var.failover_region
  project            = var.project_id
  authorized_network = var.network_id
  depends_on         = [google_service_networking_connection.private_vpc_connection]
}



