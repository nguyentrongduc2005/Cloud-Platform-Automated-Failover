terraform {
  backend "gcs" {
    bucket = "apsas-tf-state-prod-bucket2"
    prefix = "terraform/state/prod"
  }
}
