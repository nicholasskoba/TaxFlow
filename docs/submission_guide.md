# Submission Guide

## Что входит в проект

- Backend на Express + TypeScript
- Frontend на Next.js + TypeScript + Tailwind CSS
- PostgreSQL через Docker Compose
- Prisma ORM и миграции
- Auth через JWT в httpOnly cookie
- Роли `USER` и `ADMIN`
- Модули доходов, категорий, налоговых правил и расчетов
- Отчеты, dashboard и графики
- Admin-зона
- Audit log
- Swagger/OpenAPI
- Postman collection
- Smoke API script
- Документация в `docs/`

## Как запустить

1. Запустить PostgreSQL:

```bash
docker compose up -d
```

2. Запустить backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

3. Запустить frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Открыть приложение:

```text
http://localhost:3000
```

## Как проверить

Backend:

```bash
cd backend
npm run build
npm run prisma:generate
npm run smoke:api
```

Frontend:

```bash
cd frontend
npm run build
```

Manual checklist:

```text
docs/manual_checklist.md
```

QA report:

```text
docs/qa_report.md
```

## Demo accounts

```text
admin@banktax.local / admin123
user@banktax.local  / user123
```

## Swagger

```text
http://localhost:3001/api/docs
```

## Postman collection

```text
docs/postman_collection.json
```

Переменная:

```text
baseUrl = http://localhost:3001/api
```

## Документация

- `docs/project_overview.md`
- `docs/architecture.md`
- `docs/api_endpoints.md`
- `docs/test_cases.md`
- `docs/diagrams.md`
- `docs/screenshots_plan.md`
- `docs/manual_checklist.md`
- `docs/qa_report.md`
- `docs/postman_collection.json`

## Страницы для демонстрации на защите

Рекомендуемый порядок:

1. `/`
2. `/login`
3. `/dashboard`
4. `/dashboard/incomes`
5. `/dashboard/incomes/new`
6. `/dashboard/taxes`
7. `/dashboard/taxes/history`
8. `/dashboard/reports`
9. `http://localhost:3001/api/docs`
10. `/admin`
11. `/admin/users`
12. `/admin/income-categories`
13. `/admin/tax-rules`
14. `/admin/audit-logs`

## Папка сдачи

Финальная папка:

```text
BankTaxAccounting_Submit/
```

Архив:

```text
BankTaxAccounting_Diploma_Project.zip
```
