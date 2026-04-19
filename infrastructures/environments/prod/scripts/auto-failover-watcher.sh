#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROD_DIR="$(cd "$ROOT_DIR/.." && pwd)"

CHECK_URL="${CHECK_URL:-http://34.160.100.91/api/healthz}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-20}"
FAIL_THRESHOLD="${FAIL_THRESHOLD:-3}"

FAIL_COUNT=0

echo "Monitoring $CHECK_URL every ${INTERVAL_SECONDS}s. Threshold=$FAIL_THRESHOLD"

while true; do
  if curl -fsS "$CHECK_URL" >/dev/null 2>&1; then
    FAIL_COUNT=0
    echo "$(date -u +%FT%TZ) primary health ok"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo "$(date -u +%FT%TZ) health check failed (${FAIL_COUNT}/${FAIL_THRESHOLD})"
  fi

  if [[ "$FAIL_COUNT" -ge "$FAIL_THRESHOLD" ]]; then
    echo "Primary health failed threshold. Triggering failover cutover."
    "$ROOT_DIR/failover-promote-and-cutover.sh"
    exit 0
  fi

  sleep "$INTERVAL_SECONDS"
done
