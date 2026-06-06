# Manual Checklist

Use this checklist before the diploma defense. The goal is a reliable local demo, not deployment.

## 1. Environment

Backend `backend/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bank_tax_accounting_db?schema=public"
JWT_SECRET="replace_with_a_long_random_local_secret"
CLIENT_URL="http://localhost:3000"
SMOKE_API_URL="http://localhost:3001/api"
```

Frontend `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 2. Database Option A: PostgreSQL Without Docker

1. Start local PostgreSQL.
2. Create database `bank_tax_accounting_db`.
3. Check `DATABASE_URL` in `backend/.env`.

## 3. Database Option B: Optional Docker PostgreSQL

```bash
docker compose up -d
```

Check that PostgreSQL is available on `localhost:5432`.

## 4. Backend Setup

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Check:

- `http://localhost:3001/api/health`
- `http://localhost:3001/api/docs`

## 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## 6. Demo User Flow

1. Login as `user@banktax.local / user123`.
2. Open `/dashboard`.
3. Check totals, charts and latest activity.
4. Open `/dashboard/incomes`.
5. Create a new income.
6. Edit the created income.
7. Use income filters.
8. Open `/dashboard/taxes`.
9. Select an income and run automatic tax calculation.
10. Check tax amount, net amount, selected rule and breakdown.
11. Open `/dashboard/taxes/history`.
12. Check history filters and summary.
13. Open `/dashboard/my-tax-rules`.
14. Create or edit a personal tax rule.
15. Open `/dashboard/reports`.
16. Build monthly, yearly and custom period reports.
17. Download CSV export and make sure the file opens.

## 7. Demo Admin Flow

1. Logout.
2. Login as `admin@banktax.local / admin123`.
3. Open `/admin`.
4. Open `/admin/users`.
5. Filter users and update a user name or role.
6. Check that the last admin cannot be demoted.
7. Open `/admin/income-categories`.
8. Create, edit and delete a temporary category.
9. Try to delete a used category and confirm the backend returns an error.
10. Open `/admin/tax-rules`.
11. Create or edit a fixed rule.
12. Create or edit a progressive rule with threshold and extra rate.
13. Delete a used rule and confirm it is deactivated rather than removed.
14. Open `/admin/audit-logs`.
15. Check audit log filters.

## 8. Access Control

1. Logout.
2. Open `/dashboard` without login and confirm redirect to `/login`.
3. Login as `USER`.
4. Open `/admin/users`.
5. Confirm that admin UI access is denied.
6. Optionally call `/api/users` as `USER` and confirm `403`.

## 9. Swagger

1. Open `http://localhost:3001/api/docs`.
2. Check these groups: Auth, Users, Income Categories, Incomes, Tax Rules, Tax Calculations, Reports, Dashboard, Audit Logs.
3. Check cookie auth description.
4. Make sure `my-tax-rules`, `calculate-auto`, report exports and audit logs are visible.

## 10. Smoke API

Backend must be running.

```bash
cd backend
npm run smoke:api
```

Expected output:

```text
Smoke API checks passed
```

## 11. Final Visual Pass

1. Open all main pages in a normal browser, not only headless checks.
2. Check Russian text rendering.
3. Check that no important table is empty after seed.
4. Keep Swagger, frontend and backend terminals ready for the defense.
