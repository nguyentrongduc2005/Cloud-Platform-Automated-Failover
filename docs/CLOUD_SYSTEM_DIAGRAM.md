# Sơ đồ tổng thể hệ thống Cloud

Tài liệu này mô tả kiến trúc cloud toàn hệ thống APSAS trên GCP ở mức tổng quan, bám theo hạ tầng Terraform hiện tại.

## 1) Sơ đồ kiến trúc tổng thể

```mermaid
flowchart LR
    U[Người dùng / Browser] --> LB[Global HTTP Load Balancer\nPublic IP toàn cầu]

    subgraph GCP[GCP Project: fair-circuit-491210-k3]
        LB -->|/api| BEBS[Backend Service\nServerless NEG]
        LB -->|/| FEBS[Frontend Service\nServerless NEG]

        subgraph R1[Primary Region: europe-west4]
            BEP[Cloud Run\napsas-backend-primary]
            FEP[Cloud Run\napsas-frontend-primary]
            DBP[(Cloud SQL MySQL\nPrimary - Regional)]
            RP[(Redis Primary)]
            KP[(Managed Kafka Primary)]
            VPCC1[VPC Connector Primary]
        end

        subgraph R2[Failover Region: asia-east1]
            BEF[Cloud Run\napsas-backend-failover]
            FEF[Cloud Run\napsas-frontend-failover]
            DBR[(Cloud SQL MySQL\nReplica)]
            RF[(Redis Failover)]
            KF[(Managed Kafka Failover)]
            VPCC2[VPC Connector Failover]
        end

        BEBS --> BEP
        BEBS -->|khi bật failover traffic| BEF
        FEBS --> FEP
        FEBS -->|khi bật failover traffic| FEF

        BEP --> VPCC1 --> DBP
        BEP --> VPCC1 --> RP
        BEP --> VPCC1 --> KP

        BEF --> VPCC2 --> DBP
        BEF --> VPCC2 --> RF
        BEF --> VPCC2 --> KF

        DBP -. replication .-> DBR

        subgraph OBS[Observability]
            MON[Cloud Monitoring\nUptime checks + Alerts]
            LOG[Cloud Logging\nError metrics]
        end

        BEP --> LOG
        BEF --> LOG
        FEP --> LOG
        FEF --> LOG
        LB --> MON

        subgraph OPS[Vận hành hạ tầng]
            AR[Artifact Registry]
            TF[Terraform Apply thủ công]
        end

        TF --> AR
        TF --> BEP
        TF --> BEF
        TF --> FEP
        TF --> FEF
        TF --> LB
        TF --> DBP
        TF --> DBR
    end
```

## 2) Diễn giải nhanh

- Luồng người dùng đi vào một Global Load Balancer duy nhất.
- LB tách traffic theo đường dẫn: `/api` vào backend, còn lại vào frontend.
- Mỗi lớp FE/BE có 2 dịch vụ Cloud Run (primary + failover).
- Backend primary và failover đều được cấu hình truy cập DB active qua biến `MYSQL` do Terraform quản lý.
- Cloud SQL có replica cross-region để sẵn sàng promote khi sự cố.
- Monitoring + Logging dùng để theo dõi uptime và cảnh báo lỗi.
- Hệ thống hiện tập trung vận hành hạ tầng thủ công qua Terraform và `gcloud`.

## 3) Mapping hạ tầng với Terraform

- Networking: `infrastructures/modules/networking/main.tf`
- Cloud Run: `infrastructures/modules/cloud_run/main.tf`
- Load Balancer: `infrastructures/modules/global_load_balancer/main.tf`
- Database + Redis: `infrastructures/modules/database/main.tf`
- Kafka: `infrastructures/modules/kafka/main.tf`
- Monitoring: `infrastructures/modules/monitoring/main.tf`
- Platform services: `infrastructures/modules/platform_services/main.tf`
- Root wiring production: `infrastructures/environments/prod/main.tf`

## 4) Ghi chú failover

- Failover traffic được điều khiển bằng biến `enable_failover_traffic`.
- Failover DB hiện vận hành thủ công bằng lệnh `gcloud` (promote replica + cập nhật `MYSQL` cho Cloud Run).
- Sau khi promote DB replica, cần cập nhật `active_db_private_ip_override` trong `terraform.tfvars` để tránh drift IaC.
