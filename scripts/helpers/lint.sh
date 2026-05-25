#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EXIT=0

echo "=== Lint & Type Checks ==="
echo ""

# Frontend lint
echo "--- Frontend Lint (ESLint) ---"
if cd "$PROJECT_ROOT/frontend" && npm run lint 2>&1; then
  echo -e "${GREEN}[PASS]${NC} Frontend lint passed"
else
  echo -e "${RED}[FAIL]${NC} Frontend lint found issues"
  EXIT=1
fi
echo ""

# Frontend typecheck
echo "--- Frontend TypeScript Check ---"
if cd "$PROJECT_ROOT/frontend" && npx tsc --noEmit 2>&1; then
  echo -e "${GREEN}[PASS]${NC} Frontend typecheck passed"
else
  echo -e "${RED}[FAIL]${NC} Frontend typecheck found errors"
  EXIT=1
fi
echo ""

# Backend typecheck
echo "--- Backend TypeScript Check ---"
if cd "$PROJECT_ROOT/backend" && npx tsc --noEmit 2>&1; then
  echo -e "${GREEN}[PASS]${NC} Backend typecheck passed"
else
  echo -e "${RED}[FAIL]${NC} Backend typecheck found errors"
  EXIT=1
fi
echo ""

exit $EXIT
