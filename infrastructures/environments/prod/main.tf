
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
