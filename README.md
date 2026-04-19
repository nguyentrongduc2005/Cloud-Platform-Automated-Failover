# Cloud Platform Automated Failover (CPAF)

[![Terraform](https://img.shields.io/badge/Terraform-1.5.0+-844FBA.svg?style=flat&logo=terraform)](https://www.terraform.io/)
[![GCP](https://img.shields.io/badge/GCP-Infrastructure-4285F4.svg?style=flat&logo=google-cloud)](https://cloud.google.com/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.x-6DB33F.svg?style=flat&logo=spring-boot)](https://spring.io/projects/spring-boot)

This project focuses on building a highly resilient cloud infrastructure capable of **Automated Failover** and **Zero-Downtime**. Deployed on Google Cloud Platform (GCP) using Infrastructure as Code (IaC), the system is designed to monitor the health of application instances in real-time and automatically switch traffic to redundant backup nodes in the event of a critical failure, while elastically scaling based on traffic demands.

## 🏗 System Architecture

The infrastructure implements a **Multi-Zone High Availability** topology to eliminate single points of failure.

![Architecture Diagram](https://via.placeholder.com/800x400?text=Insert+Architecture+Diagram+Here)

**Core Architectural Components:**

- **Cloud Load Balancing:** Acts as the global entry point, performing health checks and intelligently routing user traffic away from degraded zones.
- **Managed Instance Groups (MIGs):** Deploys the Spring Boot backend across multiple availability zones.
- **Auto-healing Mechanism:** Integrates with Spring Boot Actuator (`/actuator/health`). If a VM crashes or the application hangs, the MIG instantly terminates and replaces the instance.
- **Auto Scaling:** Automatically adds or removes VM instances based on CPU utilization to optimize costs and performance.
- **High-Availability Cloud SQL:** A primary-standby PostgreSQL configuration. If the primary zone fails, the database automatically fails over to the standby zone.

## 🚀 Key Features

- **Real-time Health Monitoring:** Proactive detection of application-level failures, not just hardware status.
- **Automated Disaster Recovery:** The system rebuilds crashed nodes without manual operational intervention.
- **Infrastructure as Code (IaC):** 100% of the GCP infrastructure is provisioned and managed using Terraform modules.
- **Zero-Downtime Deployments:** Capable of rolling updates without dropping active user connections.

## 📁 Repository Structure

The infrastructure is built using a highly modular Terraform design pattern:

````text
.
├── APSAS_BE/                # Spring Boot Backend Application
├── APSAS_FE/                # Frontend Client
└── infrastructures/         # Terraform Infrastructure Setup
    ├── modules/
    │   ├── vpc/             # VPC, Subnets, Cloud Router, Cloud NAT
    │   ├── compute/         # Instance Templates, Auto Scaling, MIGs
    │   ├── load_balancer/   # Backend Services, Health Checks, Frontend IP
    │   └── database/        # Cloud SQL HA Configuration
    ├── scripts/
    │   └── startup-be.sh    # Automated server bootstrapping script
    ├── main.tf              # Entry point linking all modules
    ├── providers.tf         # GCP Provider configuration
    └── variables.tf         # Parameterized environment variables

## GitHub CI/CD (Cloud Run)

This repository already includes two workflows:

- `.github/workflows/ci.yml`: runs backend tests and frontend lint/build.
- `.github/workflows/deploy-cloudrun.yml`: deploys to Cloud Run and updates infra with Terraform.

Deploy workflow is configured to run when CI succeeds on `main` (and can also be run manually via `workflow_dispatch`).

### 1) Configure GitHub Secrets

Create these repository secrets in GitHub:

- `GCP_PROJECT_ID`: `fair-circuit-491210-k3`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: use Terraform output `github_workload_identity_provider`
- `GCP_SERVICE_ACCOUNT`: use Terraform output `cicd_service_account_email`
- `DB_PASSWORD`: database password used by Terraform variable `db_password`

You can get provider/service-account values from Terraform outputs:

```bash
cd infrastructures/environments/prod
terraform output -raw github_workload_identity_provider
terraform output -raw cicd_service_account_email
````

### 2) Ensure WIF is bound to this repository

`github_repository` and `github_branch` in `infrastructures/environments/prod/terraform.tfvars` must match your GitHub repo and branch:

- `github_repository = "nguyentrongduc2005/Cloud-Platform-Automated-Failover"`
- `github_branch = "main"`

If you changed repo/branch, run Terraform apply again so IAM/WIF condition is updated.

### 3) Push code to trigger CI/CD

```bash
git add .
git commit -m "ci: enable cloud run deployment from github actions"
git push origin main
```

Pipeline behavior:

- CI runs first (`ci.yml`).
- If CI passes, deploy workflow runs (`deploy-cloudrun.yml`).
- Deploy workflow builds/pushes BE + FE images to Artifact Registry and runs Terraform plan/apply with those image tags.

### 4) Verify after deployment

Use Terraform outputs from `infrastructures/environments/prod`:

```bash
terraform output -raw frontend_entrypoint
terraform output -raw backend_entrypoint
```

Then test:

```bash
curl -I "$(terraform output -raw frontend_entrypoint)"
curl -I "$(terraform output -raw backend_entrypoint)/healthz"
```
