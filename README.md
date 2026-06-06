# TaxFlow / bank-tax-accounting-app

TaxFlow is a diploma project: a local web application for income accounting and automatic tax calculation in KZT. A user records income, assigns an income category, calculates tax, reviews calculation history, dashboards and reports. An administrator manages users, income categories, global tax rules and audit logs.

The project is prepared for a local defense demo. It is not configured for production hosting.

## Tech Stack

Frontend:

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Recharts

Backend:

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT in httpOnly cookie
- bcrypt
- Zod
- Swagger/OpenAPI
- Helmet
- express-rate-limit

## Roles

| Role | Purpose |
|---|---|
| `USER` | Manages personal incomes, custom tax rules, tax calculations, reports and dashboard. |
| `ADMIN` | Manages users, income categories, global tax rules and audit logs. |

## Project Structure

```text
bank-tax-accounting-app/
  backend/
    prisma/                 Prisma schema, migrations and seed
    scripts/                Smoke and helper scripts
    src/
      config/               env and Swagger config
      controllers/          HTTP request handlers
      lib/                  Prisma client
      middleware/           auth, errors, rate limit
      routes/               Express API routes
      schemas/              Zod validation schemas
      services/             business logic
      types/                Express type extensions
      utils/                JWT, CSV, Decimal and tax helpers
  frontend/
    src/
      app/                  Next.js pages/routes
      components/           UI, dashboard, admin and chart components
      lib/                  API client and format helpers
      types/                frontend DTO types
  docs/                     defense docs, API notes, QA checklist and screenshots
  docker-compose.yml        optional local PostgreSQL
```

`BankTaxAccounting_Submit/` is a submission copy/archive of the project. It is not needed for normal local development, but it is left in the repository because it may be useful for diploma submission artifacts.

## Environment Variables

Backend file: `backend/.env`

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bank_tax_accounting_db?schema=public"
JWT_SECRET="replace_with_a_long_random_local_secret"
CLIENT_URL="http://localhost:3000"

# Optional: used only by npm run smoke:api
SMOKE_API_URL="http://localhost:3001/api"
```

Frontend file: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Notes:

- `CLIENT_URL` is the CORS origin allowed by the backend.
- `NEXT_PUBLIC_API_URL` is used by the frontend API client.
- Localhost defaults remain in code as development fallbacks so the demo works even if optional `.env.local` is missing.
- For production, replace `JWT_SECRET`, set `NODE_ENV=production`, use real origins and review secure cookie/CORS settings.

## Installation

Install dependencies in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

There is no root `package.json`; backend and frontend are started separately.

## Database Option A: Local PostgreSQL Without Docker

Use this option if PostgreSQL is already installed locally.

1. Create a database named `bank_tax_accounting_db`.
2. Make sure the connection string in `backend/.env` points to it:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bank_tax_accounting_db?schema=public"
```

3. Run Prisma commands from `backend/`.

## Database Option B: Optional PostgreSQL With Docker

Docker Compose is only a convenience for starting local PostgreSQL. The app itself is not Docker-only.

```bash
docker compose up -d
```

PostgreSQL will be available on `localhost:5432` with:

```text
user: postgres
password: postgres
database: bank_tax_accounting_db
```

## Prisma

Run from `backend/`:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Optional Prisma Studio:

```bash
npm run prisma:studio
```

## Demo Accounts

Seed creates stable demo accounts:

```text
admin@banktax.local / admin123
user@banktax.local  / user123
```

Seed also creates income categories, global tax rules, demo incomes and demo tax calculations so the dashboard is not empty after setup.

## Run Backend

```bash
cd backend
npm run dev
```

Backend API:

```text
http://localhost:3001/api
```

Health check:

```text
http://localhost:3001/api/health
```

Swagger UI:

```text
http://localhost:3001/api/docs
```

## Run Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:3000
```

## Main API Modules

- Auth: register, login, logout, current user
- Users: admin user list and role/name update
- Income categories: category reference data
- Incomes: CRUD, filters and summary
- Tax rules: global admin-managed rules
- My tax rules: user-managed personal rules
- Tax calculations: automatic/manual calculation, history and summary
- Reports: monthly, yearly, custom period and CSV export
- Dashboard: totals, charts and latest activity
- Audit logs: admin-only action log

Protected endpoints use cookie auth. JWT is stored in the httpOnly cookie named `token`.

## Tax Calculation

The main user flow uses:

```text
POST /api/tax-calculations/calculate-auto
```

The user sends only `incomeId`. Backend:

1. Loads the income and checks access.
2. Reads `income.category.incomeType`.
3. Looks for an active personal tax rule for the income owner and income type.
4. Falls back to the active global tax rule for the same income type.
5. Calculates tax and net amount.
6. Saves `TaxCalculation`.
7. Writes an `AuditLog` entry.

Tax rule types:

- `FIXED`: `taxAmount = income.amount * rate / 100`.
- `PROGRESSIVE`: amount up to `threshold` uses `rate`, amount above `threshold` uses `extraRate`.

The progressive formula is simplified and applies to the selected income amount. Future development can account for accumulated annual income, deductions and individual exemptions.

All financial amounts are stored and calculated in KZT. Prisma `Decimal` is used for money; API responses serialize money as strings.

## Security Notes

- JWT in httpOnly cookie `token`
- `sameSite: "lax"`
- `secure: true` when `NODE_ENV=production`
- bcrypt password hashing
- Role-based access control with `requireAuth` and `requireAdmin`
- Zod backend validation
- Prisma ORM for database access
- Helmet
- Global API rate limit and stricter auth rate limit
- Centralized error middleware

## Smoke API Test

Backend must be running first.

```bash
cd backend
npm run smoke:api
```

Expected output:

```text
Smoke API checks passed
```

## Defense Demo Flow

1. Open `http://localhost:3000`.
2. Login as `user@banktax.local / user123`.
3. Open `/dashboard` and show totals, charts and latest operations.
4. Open `/dashboard/incomes`, show filters and records.
5. Create a new income in `/dashboard/incomes/new`.
6. Open `/dashboard/taxes`, select income and run automatic tax calculation.
7. Open `/dashboard/taxes/history` and show saved calculation.
8. Open `/dashboard/my-tax-rules` and show personal rules.
9. Open `/dashboard/reports`, build monthly/yearly/period reports and export CSV.
10. Logout and login as `admin@banktax.local / admin123`.
11. Open `/admin/users`, `/admin/income-categories`, `/admin/tax-rules`, `/admin/audit-logs`.
12. Open Swagger at `http://localhost:3001/api/docs`.

## Useful Docs

- `docs/api_endpoints.md`
- `docs/architecture.md`
- `docs/manual_checklist.md`
- `docs/project_overview.md`
- `docs/qa_report.md`
- `docs/postman_collection.json`
