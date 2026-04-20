# APSAS Cloud Demo Guide (Google Console, Visual)

This document is a visual demo script for class presentation.
Goal: show clearly how this cloud project is designed, how resiliency is handled,
and how scaling works by using Google Cloud Console screens.

Project: fair-circuit-491210-k3

## 1) Demo Goal

At the end of the demo, audience should see:

- Multi-region architecture (primary + failover)
- Global Load Balancer in front of FE and BE
- Database high availability pattern (primary + replica)
- Network design (VPC, subnet, router, NAT, connector)
- Runtime scaling behavior in Cloud Run
- Monitoring and observability evidence

## 2) Recommended Demo Flow (10-15 minutes)

1. Show architecture map and regions
2. Show network and security baseline
3. Show compute/services and load balancing path
4. Show data layer (Cloud SQL, Redis, Kafka)
5. Show autoscaling evidence
6. Show resiliency/failover readiness
7. Close with cloud concepts learned

## 3) Preparation Before Class

- Open Google Cloud Console and pin these pages in browser tabs.
- Use one project only: fair-circuit-491210-k3
- Keep one app tab open at LB IP: http://34.160.100.91
- Optional: open Cloud Shell for quick smoke request

## 4) Tab List To Open In Advance

Open these Console pages in this order:

1. Network Intelligence Center or Architecture view (overview)
2. VPC network -> VPC networks
3. VPC network -> Cloud NAT
4. Network services -> Load balancing
5. Serverless -> Cloud Run
6. Databases -> Cloud SQL
7. MemoryStore for Redis
8. Managed Service for Apache Kafka
9. Operations -> Logging
10. Operations -> Monitoring (dashboards/metrics)

## 4.1) Exact Console Navigation (Click Path)

Use this exact click path in Google Cloud Console:

1. Menu -> VPC network -> VPC networks
2. Menu -> VPC network -> Cloud NAT
3. Menu -> Network services -> Load balancing
4. Menu -> Cloud Run
5. Menu -> SQL -> Instances
6. Menu -> Memorystore for Redis
7. Menu -> Managed Service for Apache Kafka
8. Menu -> Logging -> Logs Explorer
9. Menu -> Monitoring -> Metrics Explorer

If menu is collapsed, click the top-left navigation icon first.

## 5) Detailed Talk Track Per Screen

### A. Architecture Overview (1 minute)

Say:

- This is an active-passive style topology on Google Cloud.
- Primary region handles normal traffic.
- Failover region is prepared for recovery and continuity.

Point to:

- Global entrypoint
- FE and BE services
- Data services and private network path

How to perform:

1. Open project selector and choose fair-circuit-491210-k3.
2. Keep this project fixed for the full demo.
3. Open the overview page and zoom to show both regions.
4. Verbally map each component to the architecture diagram.

### B. Network Layer (2 minutes)

Console pages:

- VPC networks
- Subnets
- Cloud Router
- Cloud NAT

Say:

- Single VPC with multi-region subnets.
- Primary subnet and failover subnet are separated by CIDR.
- Cloud NAT is configured so private workloads can call external APIs.
- This is important for outbound traffic without public VM IP usage.

Cloud concepts:

- Segmentation, egress control, private networking

How to perform:

1. Open VPC networks and click main-failover-vpc.
2. Open Subnets tab and show primary + failover subnets.
3. Open Cloud NAT page and click NAT gateways.
4. Show 2 NAT entries (primary and failover regions).
5. Say why NAT is needed: private egress without public VM IP.

### C. Runtime Layer (2 minutes)

Console page:

- Cloud Run services list

Show:

- apsas-backend-primary, apsas-backend-failover
- apsas-frontend-primary, apsas-frontend-failover
- Region placement of each service

Say:

- Services are deployed across two regions.
- This supports continuity and regional resilience.

How to perform:

1. Open Cloud Run service list.
2. Filter by "apsas".
3. Click apsas-backend-primary and show region + revisions.
4. Go back and click apsas-backend-failover.
5. Repeat quickly for frontend primary/failover.

### D. Traffic Layer (2 minutes)

Console page:

- Load balancing

Show:

- URL map route for /api to backend service
- Default route to frontend service
- Backend service members (NEG per region)

Say:

- Users hit one global endpoint.
- LB routes by path and backend policy.
- FE and BE are separated at LB level for clear control.

How to perform:

1. Open Load balancing and click the external HTTP LB.
2. Open Host and path rules (URL map).
3. Point to /api routed to backend service.
4. Point to default route going to frontend service.
5. Open each backend service and show NEG members by region.

### E. Data Layer (2 minutes)

Console pages:

- Cloud SQL
- Redis
- Managed Kafka

Show:

- SQL primary instance + read replica in failover region
- Redis nodes by region
- Kafka clusters by region

Say:

- Data and messaging components are provisioned to support distributed runtime.
- Replica strategy is a core DR building block.

How to perform:

1. Open Cloud SQL Instances.
2. Click primary instance and show region, tier, connectivity.
3. Click replica instance and show read replica relation.
4. Open Memorystore and show Redis instances by region.
5. Open Managed Kafka and show cluster placement.

### F. Autoscaling Proof (2 minutes)

Console pages:

- Cloud Run -> one backend service -> Metrics tab
- Monitoring charts for request count, instance count, latency

Demo action:

- Generate short burst traffic from browser refresh or Cloud Shell loop.
- Refresh Cloud Run metrics and show instance count change.

Say:

- Under load, Cloud Run scales out automatically.
- When load drops, service scales in to optimize cost.

Cloud concepts:

- Elastic scaling, pay-per-use, managed serverless

How to perform:

1. Open Cloud Run -> apsas-backend-primary -> Metrics tab.
2. Keep chart Instance count visible.
3. Open a second browser tab at http://34.160.100.91 and refresh rapidly for 30-60 seconds.
4. Return to Metrics tab and click Refresh.
5. Show request/instance changes and explain scale out/scale in behavior.

Optional stronger evidence:

1. Open Metrics Explorer.
2. Resource type: Cloud Run Revision.
3. Metric: Container instance count.
4. Filter service_name = apsas-backend-primary.
5. Show time window Last 15 minutes.

### G. Resiliency / Recovery Readiness (2 minutes)

Console pages:

- Load balancing backend details
- Cloud Run service health/logs
- Cloud SQL replica state

Safe demo style (recommended for class):

- Do not force destructive failover in live production during presentation.
- Instead, show that failover resources are ready and explain cutover steps at high level.
- Show logs and health checks as operational evidence.

Say:

- The platform is designed so traffic can be redirected if primary fails.
- Recovery readiness is visible through prepared failover resources and health monitoring.

How to perform:

1. In Load balancing, open backend services and show secondary-region NEG exists.
2. In Cloud Run, open failover services and show they are deployed and healthy.
3. In Cloud SQL, show replica status and region.
4. In Logging, filter backend logs and show recent healthy requests.
5. Explain that this proves failover readiness without risky destructive action in class.

Suggested Logs Explorer filter:

resource.type="cloud_run_revision"
resource.labels.service_name="apsas-backend-primary"

## 6) What To Say For Cloud Subject Evaluation

Use this summary script:

1. Architecture: multi-region, global ingress, service separation FE/BE.
2. Reliability: failover-ready infrastructure and monitored health.
3. Scalability: serverless autoscaling based on demand.
4. Security/Network: private networking, VPC connector, NAT egress control.
5. Operability: centralized logs and metrics for observability.
6. Cost model: scale-in when idle reduces waste.

## 7) Quick Checklist (Before You Present)

- Project correct: fair-circuit-491210-k3
- All key services visible in Console
- LB endpoint accessible
- Cloud Run metrics tab ready
- Logging tab filtered and ready
- 1-2 backup screenshots ready in case internet/UI lag

## 7.1) Live Demo Script (Read This During Presentation)

Use this concise script while presenting:

1. "Em se demo theo 5 lop: Network, Runtime, Traffic, Data, Monitoring."
2. "Day la VPC multi-region va Cloud NAT cho outbound private egress."
3. "Day la 4 Cloud Run services cho primary va failover FE/BE."
4. "LB route /api vao backend, con route mac dinh vao frontend."
5. "Cloud SQL co primary va replica, kem Redis va Kafka theo region."
6. "Em tao burst traffic de thay autoscaling tren Cloud Run metrics."
7. "Tai nguyen failover da san sang, co the cutover khi su co xay ra."
8. "Monitoring va logs cho phep quan sat trang thai he thong real-time."

## 7.2) Troubleshooting During Demo

If a page loads slowly:

1. Switch to pre-opened tab instead of waiting.
2. Reduce time window in charts to Last 15 minutes.
3. Use screenshots backup for architecture and metrics.

If metrics do not move immediately:

1. Wait 30-90 seconds (monitoring delay is normal).
2. Click Refresh on chart.
3. Increase manual refresh traffic from browser.

If examiner asks about failover action details:

1. Answer with readiness proof in LB + Cloud Run + SQL replica.
2. Explain cutover is an operational procedure, not required to run destructively in class.

## 9) UI-Only Simulation: Primary Region Failure And Traffic To Secondary

This section is for live classroom demo using only Google Cloud Console.

### Safety First

- Prefer running this on staging project if available.
- If you must run on current project, keep simulation window short (3-5 minutes).
- Prepare rollback steps before making any LB change.

### 9.1 Baseline Check In UI

1. Open Load balancing.
2. Select the external HTTP load balancer.
3. Open Backend configuration.
4. Confirm backend services and region members:
   - Backend API service
   - Frontend web service
5. Open Cloud Run page in another tab and pin these services:
   - apsas-backend-primary
   - apsas-backend-failover
   - apsas-frontend-primary
   - apsas-frontend-failover

Expected baseline:

- Primary services receive most or all traffic.
- Failover services are ready but low/no traffic.

### 9.2 Ensure Secondary Backends Exist In LB

1. In Load balancing, open backend service for API.
2. Click Edit.
3. Verify there is a backend NEG in secondary region.
4. If missing, click Add backend and select failover NEG.
5. Save.
6. Repeat same check for frontend backend service.

Important:

- At this point, do not disable primary yet.
- First ensure both primary and secondary are healthy.

### 9.3 Simulate Primary Region Failure (UI)

Option A (recommended, reversible):

1. Open backend API service.
2. Edit primary region backend.
3. Set Capacity scaler to 0.0.
4. Save.

5. Open frontend backend service.
6. Edit primary region backend.
7. Set Capacity scaler to 0.0.
8. Save.

Option B (more aggressive):

- Remove primary backends from both backend services.

Use Option A for class demo because rollback is faster and safer.

### 9.4 Verify Traffic Moved To Secondary

1. Open app URL in browser and do refresh + a few API actions.
2. Open Logging -> Logs Explorer.
3. Filter by service_name = apsas-backend-failover.
4. Confirm new request logs appear during your test.
5. Repeat for apsas-frontend-failover if needed.

Suggested visual proof sequence for examiner:

1. Show primary capacity scaler = 0.0 in LB backend page.
2. Trigger requests from browser.
3. Show failover Cloud Run logs increasing.
4. Show app/API still responding.

### 9.5 Rollback To Normal (Primary Active)

1. Open API backend service -> Edit primary backend.
2. Set Capacity scaler back to 1.0.
3. Save.
4. Open frontend backend service -> Edit primary backend.
5. Set Capacity scaler back to 1.0.
6. Save.

Optional strict primary-only mode:

- Set failover capacity scaler to 0.0 after test.

### 9.6 What To Say During This Part

Use this short line:

- Em dang mo phong region chinh bi su co bang cach cho backend primary capacity ve 0, va he thong van phuc vu nho backend o region phu.

Then conclude:

- Day la bang chung failover o tang load balancer va runtime da san sang trong kien truc cloud multi-region.

## 8) Notes

- This guide intentionally uses Google Console UI for visual explanation.
- Keep production-safe actions only during class demo.
- If examiner asks for deeper proof, show metric timelines and log correlation.
