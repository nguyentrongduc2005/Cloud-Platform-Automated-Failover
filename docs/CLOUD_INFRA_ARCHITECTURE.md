# Tài Liệu Kiến Trúc Hạ Tầng Cloud - Cloud Platform Automated Failover

## 1. Mục tiêu hạ tầng

Dự án được thiết kế theo định hướng:

- Đa vùng (multi-region) trên GCP để giảm downtime.
- Một điểm vào duy nhất cho cả FE và BE.
- Sẵn sàng cho failover traffic và failover cơ sở dữ liệu.
- Toàn bộ hạ tầng quản lý bằng Terraform theo kiến trúc module.

Mục tiêu vận hành:

- FE/BE chạy trên Cloud Run ở 2 vùng.
- Dữ liệu và cache đi qua private networking.
- Giảm chênh lệch trạng thái giữa thao tác runtime và IaC (drift).

## 2. Tổng quan topology

### 2.1 Vùng triển khai

- Chính (Primary): `europe-west4`
- Dự phòng (Failover): `asia-east1`

### 2.2 Lớp compute

- 4 dịch vụ Cloud Run:
  - `apsas-backend-primary`
  - `apsas-backend-failover`
  - `apsas-frontend-primary`
  - `apsas-frontend-failover`

### 2.3 Lớp dữ liệu

- Cloud SQL MySQL:
  - 1 primary instance (regional)
  - 1 replica cross-region (promote khi sự cố)
- Redis:
  - 1 instance ở vùng chính
  - 1 instance ở vùng failover
- Managed Kafka:
  - 1 cluster ở vùng chính
  - 1 cluster ở vùng failover

### 2.4 Lớp traffic

- Global External Managed HTTP Load Balancer.
- URL map:
  - `/api` -> backend service
  - Các đường dẫn còn lại -> frontend service
- LB dùng serverless NEG để trỏ vào Cloud Run theo từng vùng.

## 3. Cấu trúc Terraform và mapping

Root environment production:

- `infrastructures/environments/prod/main.tf`
- `infrastructures/environments/prod/variables.tf`
- `infrastructures/environments/prod/terraform.tfvars`

Các module lõi:

- `infrastructures/modules/networking/main.tf`
- `infrastructures/modules/database/main.tf`
- `infrastructures/modules/kafka/main.tf`
- `infrastructures/modules/cloud_run/main.tf`
- `infrastructures/modules/global_load_balancer/main.tf`
- `infrastructures/modules/platform_services/main.tf`
- `infrastructures/modules/monitoring/main.tf`

### 3.1 Mapping theo từng tầng hạ tầng

Networking:

- Module: `infrastructures/modules/networking/main.tf`
- Tài nguyên chính:
  - `google_compute_network.vpc`
  - `google_compute_subnetwork.primary_subnet`
  - `google_compute_subnetwork.failover_subnet`
  - `google_compute_router` và `google_compute_router_nat` cho mỗi vùng
- Vai trò:
  - Tạo private network global cho multi-region.
  - Cho phép egress internet qua NAT mà không cần public IP cho workload.

Data plane (MySQL + Redis):

- Module: `infrastructures/modules/database/main.tf`
- Tài nguyên chính:
  - `google_service_networking_connection.private_vpc_connection`
  - `google_sql_database_instance.primary_db`
  - `google_sql_database_instance.replica_db`
  - `google_redis_instance.primary_redis`
  - `google_redis_instance.failover_redis`
- Vai trò:
  - Cấp private IP connectivity cho Cloud SQL/Redis.
  - Hỗ trợ promote replica khi failover DB.
  - Giữ an toàn sau promote nhờ `lifecycle.ignore_changes` cho `master_instance_name`.

Messaging (Kafka):

- Module: `infrastructures/modules/kafka/main.tf`
- Tài nguyên chính:
  - `google_managed_kafka_cluster.primary`
  - `google_managed_kafka_cluster.failover`
- Vai trò:
  - Cung cấp event backbone theo từng vùng.

Application compute (Cloud Run + VPC Connector + IAM runtime):

- Module: `infrastructures/modules/cloud_run/main.tf`
- Tài nguyên chính:
  - `google_service_account.runtime`
  - `google_vpc_access_connector.primary/failover`
  - `google_cloud_run_v2_service.backend_primary/failover`
  - `google_cloud_run_v2_service.frontend_primary/failover`
- Vai trò:
  - Triển khai FE/BE ở 2 vùng.
  - Cloud Run chỉ nhận traffic từ internal load balancer.
  - Gắn env vars từ Terraform (`MYSQL`, `REDIS_HOST`, `KAFKA`, ...).

Global traffic control:

- Module: `infrastructures/modules/global_load_balancer/main.tf`
- Tài nguyên chính:
  - `google_compute_region_network_endpoint_group.*`
  - `google_compute_backend_service.backend_api`
  - `google_compute_backend_service.frontend_web`
  - `google_compute_url_map.global`
  - `google_compute_global_forwarding_rule.http`
- Vai trò:
  - Một public IP global duy nhất.
  - Tách route `/api` và route web.
  - Cho phép bật/tắt failover backends bằng cờ Terraform.

Platform services:

- Module: `infrastructures/modules/platform_services/main.tf`
- Tài nguyên chính:
  - `google_artifact_registry_repository.containers`
- Vai trò:
  - Cung cấp nơi lưu image container cho hệ thống.
  - Bật các API nền tảng cần thiết cho hạ tầng.

Observability:

- Module: `infrastructures/modules/monitoring/main.tf`
- Tài nguyên chính:
  - `google_monitoring_uptime_check_config.frontend/backend`
  - `google_monitoring_alert_policy.*`
  - `google_logging_metric.backend_error_count/frontend_error_count`
- Vai trò:
  - Uptime check qua LB IP.
  - Cảnh báo khi service down hoặc log lỗi tăng.

## 4. Root wiring và biến quan trọng

Logic wiring module nằm ở `infrastructures/environments/prod/main.tf`.

Nhóm biến quan trọng ở `infrastructures/environments/prod/variables.tf`:

- `project_id`
- `primary_region`, `secondary_region`
- `enable_failover_traffic`
- `active_db_private_ip_override`
- `backend_env_vars_primary`, `backend_env_vars_failover`
- `frontend_env_vars_primary`, `frontend_env_vars_failover`
- `enable_cloud_dns`

Giá trị runtime production nằm ở `infrastructures/environments/prod/terraform.tfvars`.

## 5. Luồng traffic và dữ liệu

Luồng request bình thường:

1. Client đi vào Global LB IP.
2. URL map route `/api` sang backend service, còn lại sang frontend service.
3. Backend Cloud Run kết nối MySQL/Redis/Kafka qua VPC Connector.

Luồng failover traffic:

1. Bật `enable_failover_traffic = true`.
2. LB attach thêm NEG failover cho FE/BE.
3. Traffic có thể phân phối sang vùng failover.

Luồng failover DB:

1. Promote MySQL replica thành DB active mới.
2. Cập nhật `MYSQL` env cho `backend-primary` và `backend-failover`.
3. Đặt `active_db_private_ip_override` để Terraform không quay lại endpoint cũ ở lần apply sau.

## 6. Mapping các đoạn Terraform cần nhớ

### 6.1 Route `/api` về backend

File: `infrastructures/modules/global_load_balancer/main.tf`

```hcl
route_rules {
  priority = 1
  match_rules {
    prefix_match = "/api"
  }
  service = google_compute_backend_service.backend_api.id
}
```

### 6.2 Bật/tắt failover backend ở LB

File: `infrastructures/modules/global_load_balancer/main.tf`

```hcl
dynamic "backend" {
  for_each = var.enable_failover_backends ? [1] : []
  content {
    group           = google_compute_region_network_endpoint_group.backend_failover.id
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }
}
```

### 6.3 Chọn DB endpoint đang active

File: `infrastructures/environments/prod/main.tf`

```hcl
active_db_private_ip = var.active_db_private_ip_override != "" ? var.active_db_private_ip_override : module.database.primary_db_private_ip
```

### 6.4 Inject `MYSQL` vào Cloud Run env

File: `infrastructures/environments/prod/main.tf`

```hcl
MYSQL = format("jdbc:mysql://%s:3306/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC", local.active_db_private_ip, var.db_name)
```

### 6.5 Bảo vệ trạng thái sau khi promote replica

File: `infrastructures/modules/database/main.tf`

```hcl
lifecycle {
  ignore_changes = [master_instance_name]
}
```

## 7. Runbook vận hành ngắn gọn

Apply hạ tầng:

```bash
cd infrastructures/environments/prod
terraform init
terraform plan
terraform apply
```

Thao tác failover DB (thủ công bằng gcloud):

```bash
gcloud sql instances promote-replica apsas-prod-failover-mysql-replica \
  --project=fair-circuit-491210-k3 --quiet

gcloud run services update apsas-backend-primary \
  --project=fair-circuit-491210-k3 --region=europe-west4 \
  --update-env-vars 'MYSQL=jdbc:mysql://<ACTIVE_DB_PRIVATE_IP>:3306/cloud_failover_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC' --quiet

gcloud run services update apsas-backend-failover \
  --project=fair-circuit-491210-k3 --region=asia-east1 \
  --update-env-vars 'MYSQL=jdbc:mysql://<ACTIVE_DB_PRIVATE_IP>:3306/cloud_failover_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC' --quiet
```

Kiểm tra route qua LB:

```bash
curl -I http://<GLOBAL_LB_IP>/
curl -I http://<GLOBAL_LB_IP>/api/healthz
```

## 8. Điểm quan trọng cần quản lý chặt

1. Drift sau sự cố DB:

- Sau khi promote replica, phải cập nhật `active_db_private_ip_override` trong `terraform.tfvars`.

2. Quản lý secrets:

- Không lưu secret lâu dài trong `terraform.tfvars`.
- Ưu tiên Secret Manager hoặc secret injection qua CI/CD.

3. Chiến lược failover:

- `enable_failover_traffic` quyết định failover NEG có được attach vào LB hay không.
- Đội vận hành cần thống nhất quy tắc bật/tắt theo runbook.

4. Monitoring:

- Uptime check và alert policy là lớp cảnh báo sớm.
- Cần đảm bảo `alert_email_addresses` luôn được cập nhật.

## 9. Checklist review trước thay đổi production

- Đã chạy `terraform plan` và review drift.
- Đã kiểm tra service account và IAM roles.
- Đã kiểm tra image tag và Artifact Registry.
- Đã verify health endpoint `/api/healthz`.
- Đã xác nhận đường rollback/failover.

---

Tài liệu này chỉ tập trung vào hạ tầng cloud và Terraform mapping để triển khai, vận hành và xử lý sự cố cho hệ thống APSAS trên GCP.
