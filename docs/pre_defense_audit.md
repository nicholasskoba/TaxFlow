# Pre-Defense Audit

This file records the cleanup decisions for the local TaxFlow defense demo.

## Environment Variables

| Variable | Used by | Status |
|---|---|---|
| `NODE_ENV` | Backend cookie security and env validation | Documented in `backend/.env.example` |
| `PORT` | Backend server | Documented |
| `DATABASE_URL` | Prisma/PostgreSQL | Documented |
| `JWT_SECRET` | JWT signing and verification | Documented with non-production placeholder |
| `CLIENT_URL` | Backend CORS origin | Documented |
| `NEXT_PUBLIC_API_URL` | Frontend API client | Documented in `frontend/.env.example` |
| `SMOKE_API_URL` | Backend smoke script only | Documented as optional |

No `FRONTEND_URL` variable is used by the current code. The active backend CORS variable is `CLIENT_URL`.

Localhost fallbacks remain in code for local demo convenience:

- Backend default `PORT=3001`
- Backend default `CLIENT_URL=http://localhost:3000`
- Frontend default `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Smoke script default `http://localhost:3001/api`

These fallbacks are intentional for a local diploma demo. Production hosting would require explicit env values, a strong `JWT_SECRET`, reviewed CORS origins and production cookie settings.

## Docker

`docker-compose.yml` is kept as optional local PostgreSQL. It is not required if PostgreSQL is installed locally and `DATABASE_URL` points to an existing database.

## Legacy / Cleanup Audit

| Path | Why it looks legacy | Used anywhere | Decision |
|---|---|---|---|
| `BankTaxAccounting_Submit/` | Duplicate submission copy of backend/frontend/docs | Not imported by running apps | Left in place because it may be a diploma submission artifact |
| `backend-dev*.log`, `frontend-dev*.log`, `backend-auth-dev*.log`, `frontend-auth-dev*.log` | Runtime logs from previous local runs | Not imported | Left in place to avoid deleting possibly useful debugging artifacts; `.gitignore` already ignores `*.log` |
| `frontend-smoke.png`, `frontend-auth-dashboard.png` | Old smoke screenshots | Not imported | Left in place; screenshots can be useful as QA artifacts |
| `docs/api_endpoints.md` | Had outdated wording about progressive tax | Documentation only | Updated wording to match implemented progressive rules |
| `README.md` | Docker looked like the only DB setup path | Documentation only | Rewritten for local demo, with Docker as optional |
| `docs/manual_checklist.md` | Missing no-Docker flow and newer custom tax rules | Documentation only | Updated |

No source files were deleted during this audit.

## Seed Check

`backend/prisma/seed.ts` already uses stable upsert-style logic for demo users, categories and tax rules. It also checks for existing demo incomes and tax calculations before creating new records. It creates:

- `admin@banktax.local / admin123`
- `user@banktax.local / user123`
- Income categories
- Global tax rules
- Demo incomes
- Demo tax calculations

The dashboard should not be empty after `npm run prisma:seed`.

## Remaining Manual Checks

- Run Prisma generate/migrate/seed on the target machine.
- Build backend and frontend.
- Start backend and frontend.
- Open all main UI pages in a normal browser.
- Run `npm run smoke:api` after backend is running.
- Check Swagger at `http://localhost:3001/api/docs`.
- Confirm CSV export opens in Excel or Google Sheets.

## Known Residual Risks

- There is no full automated frontend E2E suite; manual browser QA is still required.
- Existing runtime log files are still present, but future logs are ignored by `.gitignore`.
- `BankTaxAccounting_Submit/` duplicates the project, but it may be needed for submission packaging.
- The app is prepared for local demo, not production deployment.
