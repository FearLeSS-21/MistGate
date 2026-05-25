#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
LOG_DIR="$PROJECT_ROOT/scripts/logs"

mkdir -p "$LOG_DIR"

echo "Starting MisrGate development servers..."
echo ""

# Start backend
echo "Starting backend on port 5000..."
cd "$BACKEND_DIR"
nohup npx ts-node src/server.ts > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Wait for backend to be ready
sleep 3

# Start frontend
echo "Starting frontend on port 5173..."
cd "$FRONTEND_DIR"
nohup npx vite --host 0.0.0.0 > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"

echo ""
echo "Servers are running!"
echo "  Frontend: http://localhost:5173/"
echo "  Backend:  http://localhost:5000/"
echo ""
echo "To stop: ./scripts/stop-dev.sh"
