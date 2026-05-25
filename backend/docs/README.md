# MisrGate Backend

Node.js + Express API with Prisma and MySQL.

## Requirements

- Node.js 18+
- MySQL 8 (use root `docker-compose.yml` or your own instance)

## Environment

Create `backend/.env`:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/misrgate"
JWT_SECRET="your-secret-key"
PORT=5000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload (`ts-node-dev`) |
| `npm run build` | Compile TypeScript + `prisma generate` |
| `npm start` | Run compiled `dist/server.js` |
| `npm run prisma:migrate` | Apply migrations in dev |
| `npm run prisma:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed demo users and sample applications |

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Health / welcome |
| POST | `/api/auth/register` | — | Register citizen (first user becomes admin) |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/profile` | JWT | Current user profile |
| POST | `/api/applications` | JWT | Submit application |
| GET | `/api/applications/my-applications` | JWT | List own applications |
| GET | `/api/applications/track/:trackingCode` | — | Public tracking |
| GET | `/api/admin/applications` | JWT + Admin | All applications |
| PUT | `/api/admin/applications/:id/status` | JWT + Admin | Update status |
| GET | `/api/admin/stats` | JWT + Admin | Dashboard stats |

## Data model

- **User** — email, national ID (14 digits), role `CITIZEN` | `ADMIN`
- **Application** — service type, JSON form `data`, tracking code, status
- **StatusHistory** — audit trail per status change

Service types: `NATIONAL_ID`, `MILITARY_EXEMPTION`, `BIRTH_CERTIFICATE`, `PASSPORT`.

## Security notes

- Passwords hashed with bcrypt
- JWT in `Authorization: Bearer` header
- Helmet + CORS enabled (CORS is open in dev)
