# MisrGate Documentation

MisrGate is an Egyptian e-government portal demo with a React frontend and Express + Prisma API backed by MySQL.

## Project layout

| Folder | Role |
|--------|------|
| [`backend/`](../backend/) | REST API, Prisma ORM, JWT auth |
| [`frontend/`](../frontend/) | React + Vite citizen/admin UI |
| [`docker-compose.yml`](../docker-compose.yml) | MySQL 8 database |

## Quick start

1. **Database** (from repo root):

   ```bash
   docker compose up -d
   ```

2. **Backend**:

   ```bash
   cd backend
   npm install
   npm run prisma:migrate
   npm run db:seed
   npm run dev
   ```

   API: http://localhost:5000

3. **Frontend**:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   UI: http://localhost:5173

## More docs

- [Backend docs](../backend/docs/README.md) — API routes, env vars, database
- [Frontend docs](../frontend/docs/README.md) — UI views, dev proxy, build

## Demo mode

The UI ships with a developer bypass (mock citizen user). Switch roles with the banner toggle to test the admin desk. For real API calls, register/login via `/api/auth` and store the JWT in `localStorage` as `misrgate_token`.
