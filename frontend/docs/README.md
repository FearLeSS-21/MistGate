# MisrGate Frontend

React 19 + TypeScript + Vite single-page app for citizens and admin officers.

## Requirements

- Node.js 18+
- Backend API running at http://localhost:5000 (see `backend/docs`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (default http://localhost:5173) |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve production build |
| `npm run lint` | ESLint |

## Configuration

API base URL is set in `src/services/api.ts`:

```ts
const API_BASE_URL = 'http://localhost:5000/api';
```

JWT is read from `localStorage` key `misrgate_token` when present.

## Views

| View | Description |
|------|-------------|
| Home | Services grid, tracking search, gov directory links |
| Dashboard | Citizen profile and application history |
| Apply | Multi-service form wizard |
| Track | Public timeline by tracking code |
| Admin | Queue, filters, status decisions |

## Languages

Toggle English / Arabic via the header control. RTL layout applies when Arabic is selected.

## Developer bypass

A top banner simulates a logged-in citizen without calling auth APIs. Use **Switch to Admin Desk** to test admin routes. For full auth flow, integrate login/register and call `api.setToken(token)` after login.
