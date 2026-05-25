#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

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

echo "=== Environment Checks ==="
echo ""

check "Node.js 18+ installed"        'node -e "process.exit(Number(process.version.slice(1).split(\".\")[0] < 18))"'
check "npm installed"                'command -v npm'
check "Docker installed"             'command -v docker'
check "Docker Compose installed"     'docker compose version &>/dev/null || docker-compose --version &>/dev/null'
check "TypeScript compiler (npx)"    'npx -p typescript tsc --version &>/dev/null'

echo ""
echo -e "Results: ${GREEN}${PASS} passed${NC}, ${RED}${FAIL} failed${NC}"
exit $FAIL
