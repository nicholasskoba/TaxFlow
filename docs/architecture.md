# Architecture

## Клиент-серверная архитектура

Проект разделен на два приложения:

- `frontend`: Next.js клиент, который отображает интерфейс и обращается к backend через `fetch`.
- `backend`: Express API, которое содержит бизнес-логику, авторизацию, доступ к базе данных и документацию API.

База данных PostgreSQL запускается через Docker Compose. Prisma ORM используется для типобезопасной работы с таблицами.

## Frontend

Frontend построен на Next.js App Router. Основные страницы:

- `/login`, `/register`
- `/dashboard`
- `/dashboard/incomes`
- `/dashboard/taxes`
- `/dashboard/reports`
- `/admin`

Все protected-запросы выполняются с `credentials: "include"`, чтобы браузер отправлял httpOnly cookie `token`.

## Backend

Backend построен на Express + TypeScript. Основные слои:

- `routes`: маршруты API
- `controllers`: обработка HTTP-запросов
- `services`: бизнес-логика
- `schemas`: Zod-валидация
- `middleware`: auth, error handling, rate limit
- `lib/prisma.ts`: Prisma Client

## Database

Основные сущности:

- `User`
- `IncomeCategory`
- `Income`
- `TaxRule`
- `TaxCalculation`
- `AuditLog`

Денежные значения хранятся через Prisma `Decimal`, а в API возвращаются строками.
Все финансовые суммы фиксированы в KZT: доходы сохраняются в тенге, налоговые расчеты и отчеты используют `Income.amount` без валютной конвертации.
CSV export endpoints используют ту же логику отчетов, что и JSON endpoints, и возвращают UTF-8 CSV с BOM для корректного открытия в Excel.

## Auth flow

1. Пользователь отправляет email и пароль.
2. Backend проверяет пароль через bcrypt.
3. Backend создает JWT.
4. JWT сохраняется в httpOnly cookie `token`.
5. Protected endpoints читают cookie и проверяют JWT.
6. Middleware `requireAuth` кладет пользователя в `req.user`.
7. Middleware `requireAdmin` дополнительно проверяет роль `ADMIN`.

## Tax calculation flow

1. Пользователь выбирает доход.
2. Frontend отправляет `incomeId` в `/api/tax-calculations/calculate-auto`.
3. Backend загружает доход и категорию.
4. Backend берет `IncomeCategory.incomeType`.
5. Backend выбирает активное `TaxRule` с таким же `incomeType`.
6. Backend рассчитывает налог и чистый доход.
7. Расчет сохраняется в `TaxCalculation`.
8. Действие пишется в `AuditLog`.

Активное налоговое правило выбирается по связке `IncomeCategory.incomeType` -> `TaxRule.incomeType`. В справочнике поддерживаются типы `SALARY`, `FREELANCE`, `INVESTMENT`, `RENT`, `DIVIDENDS`, `PRIVATE_PRACTICE`, `ROYALTY`, `SALE_PROPERTY` и `OTHER`.

Справочные правила используют фиксированные ставки для демонстрации: 10% для большинства доходов, 5% для дивидендов и 9% для доходов частной практики. Формула расчета остается простой и не реализует прогрессивную шкалу или индивидуальные льготы.

После расширения налогового модуля `TaxRule` поддерживает два типа: `FIXED` и `PROGRESSIVE`. Для `PROGRESSIVE` дополнительно хранятся `threshold` и `extraRate`. Пользовательские правила помечаются `isCustom = true` и связаны с владельцем через `userId`.

Автоматический расчет выбирает правило в таком порядке:

1. Активное личное правило владельца дохода по `incomeType`.
2. Активное глобальное правило по `incomeType`.
3. Если правило не найдено, API возвращает ошибку.

Прогрессивная формула применяется к сумме выбранного дохода. Расширение до годового накопительного расчета, вычетов и льгот можно реализовать отдельным этапом.

## Admin flow

Admin-зона доступна только роли `ADMIN`. Frontend использует `AdminGuard`, а backend защищает endpoints через `requireAdmin`. Администратор может управлять пользователями, категориями доходов, налоговыми правилами и смотреть audit log.

## Audit log flow

При важных действиях сервис вызывает `createAuditLog`. В журнал сохраняются:

- пользователь, выполнивший действие;
- тип действия;
- сущность;
- id сущности;
- дата создания записи.
