# Multi-Tenant Task Management System

Production-ready full-stack task management platform with strict tenant isolation, JWT + Google OAuth authentication, role-based access control, audit logging, and a polished admin-dashboard UI.

## Stack

- **Backend**: Node.js 20 + Express + PostgreSQL 16
- **Frontend**: React 18 + Vite + Tailwind CSS (Inter + Heroicons)
- **Auth**: JWT (7-day expiry, bcrypt password hashing) + Google OAuth (Identity Services)
- **Containerization**: Docker + Docker Compose (3 services: `postgres`, `backend`, `frontend`)

## Features

- Multi-tenant workspace (org-scoped, strict isolation at the query layer)
- Email/password login **and** Google one-tap sign-in
- Role-based access control (admin / member)
- Task CRUD with filters (status, priority, search)
- Invite team members (temporary password generated server-side)
- Admin-only audit trail per task (`CREATED`, `UPDATED`, `STATUS_CHANGED`, `DELETED`)
- Polished dashboard with colored stat cards, empty states, status badges

## Prerequisites

- Docker Desktop (recommended path) — or
- Node.js 20+ and PostgreSQL 16+ (local path)

## Quick Start — Docker (recommended)

```bash
# 1. Copy the compose env file (optional, safe defaults are baked in)
cp .env.example .env

# 2. Boot everything
docker compose up --build
```

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:3000       |
| Backend  | http://localhost:5000/api   |
| Postgres | localhost:5433 (on host)    |

> The backend auto-runs `src/migrations/init.sql` on boot, so the schema is created the first time. Data persists in the `postgres_data` volume.

### Configuration (docker-compose)

All values have safe defaults; override in `.env`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `postgres` / `postgres` / `task_manager` | Postgres bootstrap |
| `POSTGRES_PORT` | `5433` | Host port for Postgres |
| `BACKEND_PORT` | `5000` | Host port for backend API |
| `FRONTEND_PORT` | `3000` | Host port for frontend |
| `JWT_SECRET` | `change_me_in_production` | **Change this in prod** |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowlist (comma-separated for multiple) |
| `VITE_API_URL` | `http://localhost:5000/api` | Baked into the Vite bundle |
| `GOOGLE_CLIENT_ID` | _(unset)_ | Backend verifier (optional) |
| `VITE_GOOGLE_CLIENT_ID` | _(unset)_ | Frontend button (optional) |

## Quick Start — Local (without Docker)

```bash
# Terminal 1: Postgres (any local install — create db `task_manager`)

# Terminal 2: Backend
cd backend
npm install
cp .env.example .env      # edit DATABASE_URL / JWT_SECRET / GOOGLE_CLIENT_ID
npm run dev               # or npm start

# Terminal 3: Frontend
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

## Authentication

### JWT (default)

- Passwords hashed with `bcryptjs` (10 rounds).
- Token payload: `{ userId, organizationId, role, email }`, 7-day expiry, HS256 signed with `JWT_SECRET`.
- `Authorization: Bearer <token>` — the frontend `axios` interceptor attaches it automatically. 401 → auto-logout.
- Every query filters by `organization_id` for tenant isolation.

### Google OAuth (optional)

Enabled automatically when both `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend) are set.

**Setup (≈ 3 minutes):**

1. Go to <https://console.cloud.google.com/apis/credentials>.
2. Create an **OAuth 2.0 Client ID** → _Web application_.
3. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (Docker)
   - `http://localhost:5173` (Vite dev)
4. Copy the **Client ID** into both env vars:
   ```env
   GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
   ```
5. Restart (`docker compose up --build` or local `npm run dev`).

**Flow:**

- Frontend loads Google Identity Services, renders the official button.
- On sign-in, it POSTs the ID token to `POST /api/auth/google`.
- Backend verifies the token with `google-auth-library`:
  - If the email already exists → link `google_id` (if absent), issue JWT.
  - If new → create a workspace (using `orgName`/`orgSlug` from the registration form if provided, otherwise `<name>'s workspace`), make the user its admin, issue JWT.

Facebook/GitHub/etc. follow the same pattern — add a new service function + route.

## API Reference (abridged)

```
POST   /api/auth/register            body: { orgName, orgSlug, name, email, password }
POST   /api/auth/login               body: { email, password }              → { token, user }
POST   /api/auth/google              body: { credential, orgName?, orgSlug? } → { token, user, created }
POST   /api/auth/invite   (admin)    body: { name, email, role }            → { user, temporaryPassword }
GET    /api/auth/me       (auth)
GET    /api/tasks         (auth)     query: status, priority, search
POST   /api/tasks         (auth)
GET    /api/tasks/:id     (auth)
PUT    /api/tasks/:id     (author|admin)
DELETE /api/tasks/:id     (admin)
GET    /api/tasks/:id/audit (admin)
GET    /api/users         (admin)
PATCH  /api/users/:id/role (admin)
```

## Project Layout

```
project-root/
├── backend/               Express API (JWT + Google OAuth, RBAC, audit)
│   ├── src/
│   │   ├── app.js
│   │   ├── config/db.js
│   │   ├── middleware/{auth,rbac}.js
│   │   ├── modules/{auth,tasks,users,organizations}/
│   │   └── migrations/init.sql
│   ├── .env.example
│   └── Dockerfile
├── frontend/              React + Vite + Tailwind (polished UI)
│   ├── src/
│   │   ├── pages/         Login, Register, Dashboard, Tasks, Team, Profile
│   │   ├── components/    Navbar, Modals, Badges, GoogleAuthButton
│   │   ├── context/AuthContext.jsx
│   │   └── api/           axios client + endpoints
│   ├── .env.example
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml     postgres + backend + frontend
├── .env.example           Compose-level config (OAuth, ports, secrets)
└── README.md
```

## Troubleshooting

- **CORS errors** → make sure `FRONTEND_URL` (backend) matches the origin your browser uses (e.g. `http://localhost:5173` in dev, `http://localhost:3000` in Docker). You can pass a comma-separated list.
- **"Google OAuth is not configured on the server"** → set `GOOGLE_CLIENT_ID` on the backend and restart.
- **Google button doesn't appear** → set `VITE_GOOGLE_CLIENT_ID` and rebuild the frontend (Vite bakes env vars at build time).
- **Stale Docker build after env change** → `docker compose up --build --force-recreate`.
- **Port already in use** → override `BACKEND_PORT` / `FRONTEND_PORT` / `POSTGRES_PORT` in `.env`.

## Security notes

- Change `JWT_SECRET` before deploying.
- Run behind HTTPS in production; the backend sets `helmet()` defaults.
- Rate limiting and email-delivery for invites are intentionally out of scope.
