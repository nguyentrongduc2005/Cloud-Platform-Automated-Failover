
# Bắt buộc phải có đoạn này trong thư mục prod/main.tf
module "networking" {
  source               = "../../modules/networking" # Đường dẫn trỏ ngược về thư mục module
  project_id           = var.project_id
  vpc_name             = "core-failover-vpc"
  primary_region       = "asia-southeast1"
  failover_region      = "asia-east1"
  primary_subnet_cidr  = "10.0.0.0/24"
  failover_subnet_cidr = "10.1.0.0/24"
}
