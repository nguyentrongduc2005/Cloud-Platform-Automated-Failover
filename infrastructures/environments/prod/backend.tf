terraform {
  backend "gcs" {
    bucket = "apsas-tf-state-prod-bucket1"
    prefix = "terraform/state/prod"
  }
}
