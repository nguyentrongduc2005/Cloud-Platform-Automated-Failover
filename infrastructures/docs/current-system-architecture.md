# Current System Architecture (Production)

## Overview

This document describes the current deployed production architecture after migration to multi-region GKE with fleet-based multi-cluster traffic routing.

## High-Level Diagram

```mermaid
flowchart TB
  U[End Users]
  DNS[Public DNS: api.your-domain]

  subgraph GCP[Google Cloud Project: fair-circuit-491210-k3]
    subgraph Fleet[GKE Fleet / Hub]
      HUBP[Membership: apsas-prod-primary]
      HUBF[Membership: apsas-prod-failover]
      MCSF[Feature: MultiClusterServiceDiscovery]
      MCIF[Feature/API: MultiClusterIngress]
    end

    subgraph GlobalTraffic[Global Multi-Cluster Traffic Entry]
      MCI[MultiClusterIngress: apsas-backend-mci]
      MCS[MultiClusterService: apsas-backend-mcs]
    end

    subgraph RegionPrimary[europe-west4 (Primary)]
      GKEP[GKE Autopilot Cluster\napsas-prod-primary-gke]
      APPP[Backend Pods\nlabel: app=apsas-backend]
      NSP[Namespace: apsas]

      SQLP[(Cloud SQL Primary)]
      REDISP[(Redis Primary)]
      KAFKAP[(Managed Kafka Primary)]
    end

    subgraph RegionFailover[asia-east1 (Failover)]
      GKEF[GKE Autopilot Cluster\napsas-prod-failover-gke]
      APPF[Backend Pods\nlabel: app=apsas-backend]
      NSF[Namespace: apsas]

      SQLR[(Cloud SQL Read Replica)]
      REDISF[(Redis Failover)]
      KAFKAF[(Managed Kafka Failover)]
    end

    VPC[VPC: main-failover-vpc]
  end

  U --> DNS --> MCI
  MCI --> MCS
  MCS --> APPP
  MCS --> APPF

  APPP --> SQLP
  APPP --> REDISP
  APPP --> KAFKAP

  APPF --> SQLR
  APPF --> REDISF
  APPF --> KAFKAF

  GKEP --- HUBP
  GKEF --- HUBF
  HUBP --- Fleet
  HUBF --- Fleet
  Fleet --- MCSF
  Fleet --- MCIF

  GKEP --- VPC
  GKEF --- VPC
```

## Request Flow

1. User accesses a single public API domain.
2. DNS resolves to the global multi-cluster ingress entrypoint.
3. MultiClusterIngress routes to MultiClusterService.
4. MultiClusterService selects backend pods (`app=apsas-backend`) across member clusters.
5. Traffic serves from primary region when healthy; failover region serves when primary is unavailable.

## Current Terraform Modules Involved

- `networking`
- `database`
- `gke_autopilot`
- `kafka`
- `multicluster_ingress`

## Important Runtime Requirements

- Backend workload must run in both clusters with label `app=apsas-backend`.
- Backend service port mapping must match:
  - MCS service port: `80`
  - Backend target port: `8080`
- Namespace used by MCI/MCS is `apsas`.
- Public DNS must point to the active MultiClusterIngress endpoint.

## Current Access Model

- Single user-facing API entrypoint (one domain).
- Multi-region backend capacity with automatic traffic steering capability via multi-cluster control plane.
