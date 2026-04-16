terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.25.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "7.25.0"
    }
  }
}

# Provider mặc định (sẽ dùng primary_region)
provider "google" {
  project     = var.project_id
  region      = var.primary_region
  credentials = file("terraform-admin-key.json")
}

provider "google-beta" {
  project     = var.project_id
  region      = var.primary_region
  credentials = file("terraform-admin-key.json")
}

# Provider dành cho vùng dự phòng (cần gọi alias = "google.secondary" khi dùng)
provider "google" {
  alias       = "secondary"
  project     = var.project_id
  region      = var.secondary_region
  credentials = file("terraform-admin-key.json")
}
