# Platform Services Module

This module now provisions base platform services for infrastructure operations:

- Artifact Registry repository for container images
- Required project APIs for infrastructure/runtime operations

## Terraform inputs

- `project_id`
- `region`
- `artifact_registry_repo_id`

## Outputs

- `artifact_registry_repository`
- `artifact_registry_repository_url`

## Notes

- GitHub CI/CD and Workload Identity Federation have been intentionally removed to keep the project focused on core infrastructure operations.
