#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXIT=0

echo "=== Tests ==="
echo ""

# Check if any test framework is configured
if grep -q '"test"' "$PROJECT_ROOT/backend/package.json" 2>/dev/null; then
  echo "--- Backend Tests ---"
  if cd "$PROJECT_ROOT/backend" && npm test 2>&1; then
    echo -e "${GREEN}[PASS]${NC} Backend tests passed"
  else
    echo -e "${RED}[FAIL]${NC} Backend tests failed"
    EXIT=1
  fi
else
  echo -e "${YELLOW}[SKIP]${NC} No backend test script configured. Add one in backend/package.json"
fi
echo ""

if grep -q '"test"' "$PROJECT_ROOT/frontend/package.json" 2>/dev/null; then
  echo "--- Frontend Tests ---"
  if cd "$PROJECT_ROOT/frontend" && npm test 2>&1; then
    echo -e "${GREEN}[PASS]${NC} Frontend tests passed"
  else
    echo -e "${RED}[FAIL]${NC} Frontend tests failed"
    EXIT=1
  fi
else
  echo -e "${YELLOW}[SKIP]${NC} No frontend test script configured. Add one in frontend/package.json"
fi
echo ""

exit $EXIT
