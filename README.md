# MisrGate — Egyptian E-Government Services Portal

MisrGate is a full-stack digital government services portal demo. Citizens can apply for official documents (National ID, Passport, Birth Certificate, Military Exemption, etc.), track application status in real time, and pay fees online. Administrators have a dedicated desk to review, approve, or reject applications with full audit trail.

## Features

- **8 government services** — National ID, Military & Recruitment, Civil Registry, Passport, Tax Payment, Traffic Fines, Health Insurance, Social Insurance
- **Bilingual UI** — English / Arabic with full RTL layout
- **Public tracking** — Search any application by 11-digit tracking code
- **Citizen dashboard** — View application history and status timeline
- **Admin desk** — Review queue with filters, status updates, and audit logging
- **JWT authentication** — Register, login, and role-based access (Citizen / Admin)
- **Developer bypass** — Built-in mock user toggle for quick demo (no login required)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Lucide React |
| Backend | Node.js, Express, TypeScript |
| Database | MySQL 8 (Prisma ORM) |
| Validation | Zod |
| Auth | JWT + bcrypt |
| Container | Docker Compose (MySQL) |

## Project Layout

```
MisrGate/
├── backend/              # Express REST API
│   ├── src/
│   │   ├── controllers/  # Auth & Application logic
│   │   ├── utils/        # Prisma client
│   │   └── server.ts     # Entry point & routes
│   ├── prisma/
│   │   ├── schema.prisma # Data models
│   │   └── seed.ts       # Demo data seeder
│   └── docs/README.md    # API reference
├── frontend/             # React SPA
│   ├── src/
│   │   ├── App.tsx       # Main app (all views)
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API client
│   │   └── index.css     # Full stylesheet
│   └── docs/README.md    # UI reference
├── scripts/              # Automation scripts
│   ├── helpers/          # Individual check scripts
│   └── run-all.sh        # Run everything
├── docs/README.md        # Getting started guide
├── docker-compose.yml    # MySQL 8 container
└── opencode.json         # opencode config (auto-accept)
```

## Quick Start

```bash
# 1. Start the database
docker compose up -d

# 2. Start the backend
cd backend
npm install
npm run prisma:migrate
npm run db:seed
npm run dev

# 3. Start the frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Demo Credentials (seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@misrgate.gov.eg | adminpassword |
| Citizen | zeyad@gmail.com | citizenpassword |
| Citizen | nour.hassan@gmail.com | citizenpassword |

The UI includes a **developer bypass** banner that logs in as a mock citizen automatically. Use the **Switch to Admin Desk** button to test admin features without registering.

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | Health check |
| POST | `/api/auth/register` | — | Register user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/profile` | JWT | Current user profile |
| POST | `/api/applications` | JWT | Submit application |
| GET | `/api/applications/my-applications` | JWT | List own applications |
| GET | `/api/applications/track/:code` | — | Public tracking |
| GET | `/api/admin/applications` | JWT+Admin | All applications |
| PUT | `/api/admin/applications/:id/status` | JWT+Admin | Update status |
| GET | `/api/admin/stats` | JWT+Admin | Dashboard stats |

## Data Model

- **User** — email, national ID (14 digits), role (`CITIZEN` / `ADMIN`)
- **Application** — service type, JSON form data, tracking code, status, attachment URL
- **StatusHistory** — audit trail with timestamp, officer name, and notes per status change

Service types: `NATIONAL_ID`, `MILITARY_EXEMPTION`, `BIRTH_CERTIFICATE`, `PASSPORT`, `TAX_PAYMENT`, `TRAFFIC_FINE`, `HEALTH_INSURANCE`, `SOCIAL_INSURANCE`

## Scripts

See [scripts/README.md](scripts/README.md) for available automation scripts:

```bash
# Run all checks
bash scripts/run-all.sh

# Or run individual checks
bash scripts/helpers/check-env.sh
bash scripts/helpers/check-deps.sh
bash scripts/helpers/lint.sh
```
