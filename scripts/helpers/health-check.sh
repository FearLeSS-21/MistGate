#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

BACKEND_URL="${1:-http://localhost:5000}"
FRONTEND_URL="${2:-http://localhost:5173}"

PASS=0
FAIL=0

check() {
  local label="$1"
  local cmd="$2"
  if eval "$cmd" &>/dev/null; then
    echo -e "  ${GREEN}[PASS]${NC} $label"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}[FAIL]${NC} $label"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== Health Checks ==="
echo ""

# MySQL / Docker
check "Docker MySQL container running" \
  'docker ps --format "{{.Names}}" | grep -q misrgate-db'

# Backend
check "Backend API reachable (GET /)" \
  "curl -sf $BACKEND_URL > /dev/null"

# Frontend
check "Frontend dev server reachable" \
  "curl -sf -o /dev/null $FRONTEND_URL"

echo ""
echo -e "Results: ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}"
exit $FAIL
