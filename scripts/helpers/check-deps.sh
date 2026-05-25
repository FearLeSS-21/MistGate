#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
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

echo "=== Dependency Checks ==="
echo ""

check "Backend node_modules exist"      '[ -d "$PROJECT_ROOT/backend/node_modules" ]'
check "Frontend node_modules exist"     '[ -d "$PROJECT_ROOT/frontend/node_modules" ]'
check "Prisma client generated"         '[ -d "$PROJECT_ROOT/backend/node_modules/.prisma/client" ]'
check "Backend .env file exists"        '[ -f "$PROJECT_ROOT/backend/.env" ]'
check "Docker Compose file exists"      '[ -f "$PROJECT_ROOT/docker-compose.yml" ]'
check "Backend TypeScript compiles"     'cd "$PROJECT_ROOT/backend" && npx tsc --noEmit &>/dev/null'

echo ""
echo -e "Results: ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}"
exit $FAIL
