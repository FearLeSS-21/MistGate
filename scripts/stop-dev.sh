#!/usr/bin/env bash
echo "Stopping MisrGate development servers..."
pkill -f "ts-node src/server.ts" 2>/dev/null && echo "  Backend stopped" || echo "  Backend not running"
pkill -f "vite --host" 2>/dev/null && echo "  Frontend stopped" || echo "  Frontend not running"
echo "Done."
