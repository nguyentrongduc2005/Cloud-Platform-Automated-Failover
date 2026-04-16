# Security and CI/CD Module

This module provisions GCP resources for GitHub Actions based CI/CD:

- Artifact Registry repository for container images
- CI/CD service account
- Workload Identity Federation (OIDC) for GitHub Actions
- IAM bindings for pushing images and deploying to GKE

## Terraform inputs to set in prod tfvars

- github_repository: owner/repo
- github_branch: main (or your deployment branch)
- artifact_registry_repo_id: Docker repository id
- workload_identity_pool_id
- workload_identity_provider_id
- cicd_service_account_id

## GitHub configuration after terraform apply

1. Add repository secrets:

- GCP_WORKLOAD_IDENTITY_PROVIDER: output github_workload_identity_provider
- GCP_SERVICE_ACCOUNT_EMAIL: output cicd_service_account_email

2. Add repository variables:

- GCP_PROJECT_ID
- GCP_REGION
- GAR_REPOSITORY
- GKE_PRIMARY_CLUSTER
- GKE_PRIMARY_LOCATION
- GKE_FAILOVER_CLUSTER
- GKE_FAILOVER_LOCATION
- K8S_NAMESPACE
- BACKEND_SECRET_NAME
- FRONTEND_SECRET_NAME

3. Push to main or run workflow manually:

- .github/workflows/cicd-gke-artifact-registry.yml

## Notes

- OIDC is configured to allow only the repository and branch declared in Terraform.
- The workflow deploys backend/frontend manifests to primary and failover clusters.
