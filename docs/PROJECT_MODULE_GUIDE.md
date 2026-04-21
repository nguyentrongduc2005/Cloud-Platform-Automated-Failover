# Hướng Dẫn Toàn Bộ Module Dự Án

Tài liệu này giải thích cấu trúc code và trách nhiệm của từng module trong toàn bộ dự án Cloud Platform Automated Failover.

## 1. Tổng quan kiến trúc

Dự án gồm 3 khối chính:

1. Backend ứng dụng: Spring Boot (APSAS_BE)
2. Frontend ứng dụng: React + Vite (APSAS_FE)
3. Hạ tầng: Terraform trên GCP (infrastructures)

Luồng tổng quát:

1. User đi vào Global HTTP Load Balancer
2. Route /api vào Backend Cloud Run
3. Route còn lại vào Frontend Cloud Run
4. Backend truy cập MySQL, Redis, Kafka qua VPC Connector và private networking
5. Monitoring theo dõi uptime và error logs

## 2. Bản đồ thư mục chính

- APSAS_BE: mã nguồn backend
- APSAS_FE: mã nguồn frontend
- infrastructures: hạ tầng Terraform module hóa
- docs: tài liệu kiến trúc và hướng dẫn vận hành
- locustfile.py: kịch bản load test và demo failover

## 3. Backend module map (APSAS_BE)

Ngôn ngữ và nền tảng:

- Java 21
- Spring Boot 3.5.x
- Spring Data JPA, Spring Security, Spring Kafka, Redis

File cấu hình build:

- APSAS_BE/pom.xml

Các package chính:

1. APSAS_BE/src/main/java/com/project/apsas/configuration

- Cấu hình hệ thống (security, CORS, bean, tích hợp framework)

2. APSAS_BE/src/main/java/com/project/apsas/controller

- Tầng REST API
- Nhận request từ frontend/client
- Trả response DTO

3. APSAS_BE/src/main/java/com/project/apsas/service

- Business logic chính
- Điều phối repository, integration, mapper

4. APSAS_BE/src/main/java/com/project/apsas/repository

- Data access qua Spring Data JPA
- Truy vấn MySQL

5. APSAS_BE/src/main/java/com/project/apsas/entity

- Mô hình bảng dữ liệu (JPA Entity)

6. APSAS_BE/src/main/java/com/project/apsas/dto

- Cấu trúc request/response giữa API và client

7. APSAS_BE/src/main/java/com/project/apsas/mapper

- Chuyển đổi Entity <-> DTO

8. APSAS_BE/src/main/java/com/project/apsas/integration

- Tích hợp hệ thống ngoài (AI, cloud services, third-party)

9. APSAS_BE/src/main/java/com/project/apsas/exception

- Xử lý exception tập trung
- Chuẩn hóa thông điệp lỗi API

10. APSAS_BE/src/main/java/com/project/apsas/enums

- Tập hợp constants và enum nghiệp vụ

Điểm cần nhớ khi vận hành backend:

- Kết nối DB/Redis/Kafka được inject qua environment variables ở Terraform root.
- Vùng failover backend đã có cấu hình giới hạn JVM để giảm rủi ro OOM.

## 4. Frontend module map (APSAS_FE)

Nền tảng:

- React 19 + Vite
- React Router
- Zustand
- Axios

File cấu hình build:

- APSAS_FE/package.json
- APSAS_FE/vite.config.js

Các module chính trong APSAS_FE/src:

1. components

- Chứa UI component theo domain:
  - admin
  - auth
  - lecturer
  - provider
  - student
  - common/shared/ui

2. pages

- Mỗi route màn hình chính là một page
- Có tách theo domain: admin, auth, lecturer, provider, student

3. routes

- Định nghĩa route map và bảo vệ route

4. services

- Tầng gọi API (axios/fetch wrappers)
- Tách logic giao tiếp backend khỏi UI

5. store

- Quản lý state toàn cục (Zustand)

6. context

- Context cho auth/theme và thông tin global

7. constants

- Cấu hình hằng số, mock cấu trúc dữ liệu tĩnh

8. hooks

- Custom hooks tái sử dụng (ví dụ toast)

9. utils + lib

- Hàm tiện ích dùng chung

10. data + types

- Mock data và kiểu dữ liệu phục vụ UI/dev flow

Điểm cần nhớ khi vận hành frontend:

- FE gọi API qua đường dẫn /api để đi qua LB.
- Biến VITE_API_BASE đang set /api để không hard-code host backend.

## 5. Infrastructure module map (Terraform)

### 5.1 Root wiring production

- infrastructures/environments/prod/main.tf
- infrastructures/environments/prod/variables.tf
- infrastructures/environments/prod/terraform.tfvars
- infrastructures/environments/prod/provider.tf
- infrastructures/environments/prod/backend.tf

Vai trò:

- Lắp ghép toàn bộ module
- Tính local values runtime (image, MYSQL active IP, env vars)
- Điều phối build image tự động (nếu bật)
- Điều phối DB seed import (nếu bật)

### 5.2 Module networking

- infrastructures/modules/networking/main.tf

Tài nguyên chính:

- VPC
- Primary/failover subnet
- Router + NAT cho mỗi vùng

Vai trò:

- Xây private network multi-region
- Cung cấp egress ổn định cho workload private

### 5.3 Module database

- infrastructures/modules/database/main.tf

Tài nguyên chính:

- Private service networking range
- Cloud SQL primary + replica
- Redis primary + failover

Vai trò:

- Cung cấp data plane cho backend
- Hỗ trợ kịch bản promote replica khi sự cố DB

### 5.4 Module kafka

- infrastructures/modules/kafka/main.tf

Tài nguyên chính:

- Managed Kafka primary/failover cluster

Vai trò:

- Hạ tầng event streaming theo vùng

### 5.5 Module cloud_run

- infrastructures/modules/cloud_run/main.tf

Tài nguyên chính:

- Runtime service account
- IAM runtime roles
- VPC Access Connector 2 vùng
- 4 Cloud Run services (BE/FE primary/failover)
- IAM invoker cho public access (nếu bật)

Vai trò:

- Chạy workload ứng dụng dạng serverless multi-region

### 5.6 Module global_load_balancer

- infrastructures/modules/global_load_balancer/main.tf

Tài nguyên chính:

- Global static IP
- Serverless NEGs cho FE/BE theo vùng
- Backend services + URL map + HTTP proxy + forwarding rule

Route rule chính:

- /api -> backend service
- /\* -> frontend service

Cơ chế failover hiện tại:

- capacity_scaler ưu tiên primary (1.0) và giữ failover thấp hơn (0.01)
- outlier_detection để tự eject backend lỗi

Lưu ý quan trọng:

- Với Cloud Run SERVERLESS NEG, không dùng health check backend kiểu VM truyền thống.

### 5.7 Module monitoring

- infrastructures/modules/monitoring/main.tf

Tài nguyên chính:

- Uptime check frontend/backend
- Alert policy cho uptime
- Logging metrics cho error logs FE/BE
- Alert policy cho spike log lỗi

Vai trò:

- Cảnh báo sớm khi endpoint down hoặc ứng dụng phát sinh lỗi runtime

### 5.8 Module platform_services

- infrastructures/modules/platform_services/main.tf

Tài nguyên chính:

- Enable API cần thiết cho dự án
- Artifact Registry repository

Vai trò:

- Nền tảng phụ trợ cho deploy image và chạy hạ tầng

## 6. Cấu hình quan trọng cần hiểu trước khi sửa

1. Biến vùng:

- primary_region
- secondary_region

2. Cờ failover traffic:

- enable_failover_traffic

3. Kết nối DB đang active:

- active_db_private_ip_override

4. Bootstrap Kafka:

- kafka_bootstrap_servers_primary
- kafka_bootstrap_servers_failover

5. Image deploy:

- backend_image
- frontend_image
- auto_build_images

6. Runtime env maps:

- backend_env_vars_primary
- backend_env_vars_failover
- frontend_env_vars_primary
- frontend_env_vars_failover

## 7. Quy trình deploy và kiểm tra nhanh

Deploy hạ tầng:

1. cd infrastructures/environments/prod
2. terraform init
3. terraform plan
4. terraform apply -auto-approve -input=false

Build + push + apply một lệnh:

1. cd infrastructures/environments/prod
2. ./scripts/deploy-app-update.sh

Smoke test:

1. curl http://app.<global_lb_ip>.nip.io/
2. curl http://app.<global_lb_ip>.nip.io/api/healthz

Load/failover demo:

1. start_conda
2. conda activate base
3. python -m locust -f locustfile.py -H http://app.<global_lb_ip>.nip.io -u 50 -r 10 -t 5m --headless

## 8. Tài liệu liên quan

- docs/CLOUD_INFRA_ARCHITECTURE.md
- docs/CLOUD_SYSTEM_DIAGRAM.md
- infrastructures/docs/active-passive-failover-runbook.md

## 9. Khuyến nghị cải thiện tài liệu và bảo mật

1. Đưa secrets ra Secret Manager thay vì để trong tfvars.
2. Bổ sung sơ đồ sequence cho failover traffic và failover DB.
3. Thêm checklist runbook cho tình huống Kafka/DB/Cloud Run lỗi startup.
4. Chuẩn hóa naming conventions giữa docs và tên resource thực tế để dễ truy vết.
