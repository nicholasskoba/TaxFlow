# bank-tax-accounting-app

## Описание

Дипломный проект: банковское веб-приложение для учета доходов и автоматического расчета налоговых обязательств.

На текущем этапе создана базовая структура проекта с отдельными частями frontend и backend. Проект подготовлен для дальнейшего добавления модулей авторизации, учета доходов, налоговых правил, расчетов, отчетов и административной панели.

## Стек технологий

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Recharts

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Zod
- Swagger

## Структура проекта

```text
bank-tax-accounting-app/
  README.md
  .gitignore
  docker-compose.yml
  backend/
    package.json
    tsconfig.json
    .env.example
    prisma/
      schema.prisma
    src/
      app.ts
      server.ts
      config/
        env.ts
      lib/
        prisma.ts
      routes/
        health.routes.ts
      controllers/
        health.controller.ts
      middleware/
        error.middleware.ts
      utils/
        ApiError.ts
  frontend/
    package.json
    tsconfig.json
    .env.example
    src/
      app/
        page.tsx
        layout.tsx
        globals.css
      components/
        ui/
      lib/
        api.ts
      types/
```

## Запуск PostgreSQL через Docker

Из корня проекта:

```bash
docker compose up -d
```

PostgreSQL будет доступен на порту `5432`.

## Запуск backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Backend API будет доступен по адресу:

```text
http://localhost:3001/api
```

Проверка работоспособности:

```text
GET http://localhost:3001/api/health
```

## Запуск frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend будет доступен по адресу:

```text
http://localhost:3000
```

## Основные будущие модули

- auth
- users
- incomes
- income categories
- tax rules
- tax calculation
- reports
- dashboard
- admin panel
- audit logs

## Команды для Prisma

Выполняются из папки `backend`:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:studio
```
