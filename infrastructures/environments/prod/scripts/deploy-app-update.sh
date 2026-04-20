#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROD_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$PROD_DIR/../../.." && pwd)"
TFVARS_FILE="$PROD_DIR/terraform.tfvars"

usage() {
  cat <<EOF
Usage: $(basename "$0") [tag]

Build and push backend/frontend images, then run terraform apply with those images.

Arguments:
  tag    Optional image tag. Default: UTC timestamp (YYYYmmdd-HHMMSS)

Environment overrides:
  PROJECT_ID      Override project_id from terraform.tfvars
  PRIMARY_REGION  Override primary_region from terraform.tfvars
  REPOSITORY_ID   Override artifact_registry_repo_id from terraform.tfvars
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ ! -f "$TFVARS_FILE" ]]; then
  echo "[ERROR] Missing tfvars file: $TFVARS_FILE" >&2
  exit 1
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Missing required command: $1" >&2
    exit 1
  fi
}

read_tfvar() {
  local key="$1"
  local value
  value=$(awk -F= -v key="$key" '
    $1 ~ "^[[:space:]]*" key "[[:space:]]*$" {
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", $2)
      gsub(/^"|"$/, "", $2)
      print $2
      exit
    }
  ' "$TFVARS_FILE")

  if [[ -z "$value" ]]; then
    echo "[ERROR] Unable to read $key from $TFVARS_FILE" >&2
    exit 1
  fi

  echo "$value"
}

require_cmd gcloud
require_cmd terraform
require_cmd date

PROJECT_ID="${PROJECT_ID:-$(read_tfvar project_id)}"
PRIMARY_REGION="${PRIMARY_REGION:-$(read_tfvar primary_region)}"
REPOSITORY_ID="${REPOSITORY_ID:-$(read_tfvar artifact_registry_repo_id)}"

DEPLOY_TAG="${1:-$(date -u +%Y%m%d-%H%M%S)}"
REPO_BASE="${PRIMARY_REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY_ID}"

BACKEND_IMAGE_TAGGED="${REPO_BASE}/apsas-backend:${DEPLOY_TAG}"
FRONTEND_IMAGE_TAGGED="${REPO_BASE}/apsas-frontend:${DEPLOY_TAG}"
BACKEND_IMAGE_LATEST="${REPO_BASE}/apsas-backend:latest"
FRONTEND_IMAGE_LATEST="${REPO_BASE}/apsas-frontend:latest"

echo "[INFO] Project      : $PROJECT_ID"
echo "[INFO] Region       : $PRIMARY_REGION"
echo "[INFO] Repository   : $REPOSITORY_ID"
echo "[INFO] Deploy tag   : $DEPLOY_TAG"
echo "[INFO] Backend image: $BACKEND_IMAGE_TAGGED"
echo "[INFO] Frontend image: $FRONTEND_IMAGE_TAGGED"

echo "[STEP] Build and push backend image"
cd "$REPO_ROOT"
gcloud builds submit APSAS_BE --project "$PROJECT_ID" --tag "$BACKEND_IMAGE_TAGGED" --quiet

echo "[STEP] Build and push frontend image"
gcloud builds submit APSAS_FE --project "$PROJECT_ID" --tag "$FRONTEND_IMAGE_TAGGED" --quiet

echo "[STEP] Tag backend and frontend as latest"
gcloud artifacts docker tags add "$BACKEND_IMAGE_TAGGED" "$BACKEND_IMAGE_LATEST" --quiet
gcloud artifacts docker tags add "$FRONTEND_IMAGE_TAGGED" "$FRONTEND_IMAGE_LATEST" --quiet

echo "[STEP] Terraform apply with immutable image tags"
cd "$PROD_DIR"
terraform apply -auto-approve -input=false \
  -var="auto_build_images=false" \
  -var="backend_image=$BACKEND_IMAGE_TAGGED" \
  -var="frontend_image=$FRONTEND_IMAGE_TAGGED"

echo "[DONE] Deployment completed"
echo "[DONE] Frontend URL: $(terraform output -raw frontend_entrypoint_nip_io)"
echo "[DONE] Backend URL : $(terraform output -raw backend_entrypoint_nip_io)"
