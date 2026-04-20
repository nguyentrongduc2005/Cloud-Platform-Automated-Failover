terraform {
  backend "gcs" {
    bucket      = "apsas-tf-state-prod-bucket"
    prefix      = "terraform/state/prod"
    credentials = "terraform-admin-key.json"
  }
}
