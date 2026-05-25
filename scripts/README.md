# MisrGate Scripts

Automation and utility scripts for the MisrGate project.

## Usage

```bash
# Run all checks (env, deps, lint, tests, health)
bash scripts/run-all.sh

# Run individual checks
bash scripts/helpers/check-env.sh       # Node, npm, Docker versions
bash scripts/helpers/check-deps.sh      # node_modules, .env, TypeScript compile
bash scripts/helpers/lint.sh            # ESLint + TypeScript type checks
bash scripts/helpers/test.sh            # Run project tests (if configured)
bash scripts/helpers/health-check.sh    # Are the servers running?
```

## Add a new helper

1. Create `scripts/helpers/<name>.sh`
2. Add `run_step "Label" "$HELPERS/<name>.sh"` to `scripts/run-all.sh`
