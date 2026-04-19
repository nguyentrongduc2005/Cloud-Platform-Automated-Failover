# Active-Passive Failover Runbook

This runbook applies the production behavior:

- Default traffic: primary region only
- Failover traffic: secondary region only (when manually or automatically cut over)
- Database failover: promote read replica to writable instance before switching API traffic

## Preconditions

- Local terminal has `gcloud` and `terraform` configured
- You are authenticated to project `fair-circuit-491210-k3`
- You run commands from `infrastructures/environments/prod`

## Baseline State (Primary Only)

1. Verify Terraform variable:

```bash
grep -n '^enable_failover_traffic' terraform.tfvars
```

Expected value is `false`.

2. Verify backend service points to primary NEG only:

```bash
gcloud compute backend-services describe apsas-backend-service \
  --project=fair-circuit-491210-k3 --global \
  --format='value(backends[].group)'
```

## Trigger Failover (Promote DB + Switch Traffic)

Run:

```bash
./scripts/failover-promote-and-cutover.sh
```

What it does:

1. Promotes Cloud SQL replica to writable
2. Moves backend LB to failover NEG only
3. Moves frontend LB to failover NEG only

## Optional Auto Watcher

Run watcher that cuts over after health failure threshold:

```bash
CHECK_URL='http://34.160.100.91/api/healthz' \
INTERVAL_SECONDS=20 \
FAIL_THRESHOLD=3 \
./scripts/auto-failover-watcher.sh
```

## Restore Primary Traffic

After primary stack is healthy again:

```bash
./scripts/failover-restore-primary.sh
```

This returns frontend and backend LB traffic to primary NEG only.

## Post-Checks

1. API health:

```bash
curl -fsS http://34.160.100.91/api/healthz
```

2. Login smoke test:

```bash
curl -s -X POST 'http://34.160.100.91/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data '{"email":"admin@apsas.local","password":"Admin@12345"}'
```

3. Verify backend LB members:

```bash
gcloud compute backend-services describe apsas-backend-service \
  --project=fair-circuit-491210-k3 --global \
  --format='value(backends[].group)'
```

## Notes

- This workflow avoids Terraform execution in GitHub Actions for failover switching.
- Keep failover backend runtime in read-safe mode unless DB has been promoted.
- Use manual confirmation before restoring traffic if data consistency checks are still pending.
