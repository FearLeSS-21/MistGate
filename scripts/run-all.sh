#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
HELPERS="$PROJECT_ROOT/helpers"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  MisrGate — Full Project Checks Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# --------------------------------------------------
run_step() {
  local name="$1"
  local script="$2"
  echo -e "${YELLOW}[RUNNING]${NC} $name..."
  echo ""
  if bash "$script"; then
    echo -e "${GREEN}[OK]${NC} $name passed"
  else
    echo -e "${RED}[FAIL]${NC} $name failed"
    FAILED=1
  fi
  echo ""
  echo "────────────────────────────────────────"
  echo ""
}

FAILED=0

run_step "Environment Checks"       "$HELPERS/check-env.sh"
run_step "Dependency Checks"        "$HELPERS/check-deps.sh"
run_step "Lint & Type Checks"       "$HELPERS/lint.sh"
run_step "Tests"                    "$HELPERS/test.sh"
run_step "Health Checks"           "$HELPERS/health-check.sh"

# --------------------------------------------------
echo -e "${BLUE}========================================${NC}"
if [ "$FAILED" = "0" ]; then
  echo -e "${GREEN}  All checks passed!${NC}"
else
  echo -e "${RED}  Some checks failed. Review logs above.${NC}"
fi
echo -e "${BLUE}========================================${NC}"

exit $FAILED
