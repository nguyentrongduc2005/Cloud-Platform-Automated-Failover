#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PROJECT_ID="${PROJECT_ID:-$(grep -E '^project_id\s*=' terraform.tfvars | head -n1 | cut -d'"' -f2)}"
PRIMARY_REGION="${PRIMARY_REGION:-$(grep -E '^primary_region\s*=' terraform.tfvars | head -n1 | cut -d'"' -f2)}"
SECONDARY_REGION="${SECONDARY_REGION:-$(grep -E '^secondary_region\s*=' terraform.tfvars | head -n1 | cut -d'"' -f2)}"
LB_PREFIX="${LB_PREFIX:-apsas}"

if [[ -z "$PROJECT_ID" || -z "$PRIMARY_REGION" || -z "$SECONDARY_REGION" ]]; then
  echo "Missing required values. Set PROJECT_ID PRIMARY_REGION SECONDARY_REGION."
  exit 1
fi

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud CLI not found"
  exit 1
fi

BACKEND_API_SERVICE="${BACKEND_API_SERVICE:-${LB_PREFIX}-backend-service}"
FRONTEND_WEB_SERVICE="${FRONTEND_WEB_SERVICE:-${LB_PREFIX}-frontend-service}"
BE_PRIMARY_NEG="${BE_PRIMARY_NEG:-${LB_PREFIX}-be-primary-neg}"
BE_FAILOVER_NEG="${BE_FAILOVER_NEG:-${LB_PREFIX}-be-failover-neg}"
FE_PRIMARY_NEG="${FE_PRIMARY_NEG:-${LB_PREFIX}-fe-primary-neg}"
FE_FAILOVER_NEG="${FE_FAILOVER_NEG:-${LB_PREFIX}-fe-failover-neg}"

echo "Project: $PROJECT_ID"
echo "Primary region: $PRIMARY_REGION"
echo "Secondary region: $SECONDARY_REGION"

echo "[1/2] Restoring backend API traffic to primary NEG only..."
gcloud compute backend-services add-backend "$BACKEND_API_SERVICE" \
  --global \
  --project "$PROJECT_ID" \
  --network-endpoint-group "$BE_PRIMARY_NEG" \
  --network-endpoint-group-region "$PRIMARY_REGION" \
  --balancing-mode UTILIZATION \
  --capacity-scaler 1.0 || true

gcloud compute backend-services remove-backend "$BACKEND_API_SERVICE" \
  --global \
  --project "$PROJECT_ID" \
  --network-endpoint-group "$BE_FAILOVER_NEG" \
  --network-endpoint-group-region "$SECONDARY_REGION" || true

echo "[2/2] Restoring frontend traffic to primary NEG only..."
gcloud compute backend-services add-backend "$FRONTEND_WEB_SERVICE" \
  --global \
  --project "$PROJECT_ID" \
  --network-endpoint-group "$FE_PRIMARY_NEG" \
  --network-endpoint-group-region "$PRIMARY_REGION" \
  --balancing-mode UTILIZATION \
  --capacity-scaler 1.0 || true

gcloud compute backend-services remove-backend "$FRONTEND_WEB_SERVICE" \
  --global \
  --project "$PROJECT_ID" \
  --network-endpoint-group "$FE_FAILOVER_NEG" \
  --network-endpoint-group-region "$SECONDARY_REGION" || true

echo "Primary traffic restoration completed."
