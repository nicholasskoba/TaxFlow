# QA Report

## Дата проверки

22 мая 2026

## Повторная проверка после восстановления

После отключения питания проект был повторно проверен в текущем состоянии:

- `npm run build` для backend: PASS
- `npm run prisma:generate`: PASS
- `npm run smoke:api`: PASS
- `npm run build` для frontend: PASS

Существующие QA-скриншоты и результаты браузерной проверки сохранены в `docs/screenshots/` и `docs/qa_run_results.json`.

## Окружение

- OS: Windows
- Backend: `http://localhost:3001/api`
- Frontend: `http://localhost:3000`
- Browser check: Microsoft Edge headless via Chrome DevTools Protocol
- Database: PostgreSQL через Docker Compose
- Demo user: `user@banktax.local / user123`
- Demo admin: `admin@banktax.local / admin123`

## Что проверялось

- Public pages
- Auth flow
- User flow
- Admin flow
- Access control
- Swagger UI
- Smoke API script
- Frontend/backend production build
- Создание скриншотов для диплома

## Таблица сценариев

| № | Scenario | Result | Notes |
|---:|---|---|---|
| 1 | Public: home page | PASS | `/` загружается |
| 2 | Public: login page | PASS | `/login` загружается |
| 3 | Public: register page | PASS | `/register` загружается |
| 4 | Dashboard without login | PASS | Redirect/экран входа отображается |
| 5 | Login demo user | PASS | `user@banktax.local` вошел |
| 6 | User dashboard | PASS | `/dashboard` загружается |
| 7 | User incomes page | PASS | `/dashboard/incomes` загружается |
| 8 | Create test income | PASS | Доход создан через API |
| 9 | Edit test income | PASS | Доход обновлен через API |
| 10 | Income filters | PASS | Search filter проверен |
| 11 | Tax calculation page | PASS | `/dashboard/taxes` загружается |
| 12 | Automatic tax calculation | PASS | Расчет создан через `calculate-auto` |
| 13 | Tax history page | PASS | `/dashboard/taxes/history` загружается |
| 14 | Delete test tax calculation | PASS | Расчет удален |
| 15 | Reports page | PASS | `/dashboard/reports` загружается |
| 16 | Monthly report API | PASS | `GET /api/reports/monthly` работает |
| 17 | Yearly report API | PASS | `byMonth` содержит 12 месяцев |
| 18 | Period report API | PASS | `GET /api/reports/period` работает |
| 19 | Delete test income | PASS | Тестовый доход удален |
| 20 | USER opens admin users page | PASS | Отображается отказ в доступе |
| 21 | USER calls admin API | PASS | `/api/users` возвращает `403` |
| 22 | User logout | PASS | Logout выполнен |
| 23 | Login demo admin | PASS | `admin@banktax.local` вошел |
| 24 | Admin home | PASS | `/admin` загружается |
| 25 | Admin users page | PASS | `/admin/users` загружается |
| 26 | Update user fullName | PASS | Пользователь обновлен и возвращен назад |
| 27 | Cannot demote last admin | PASS | Backend вернул `400` |
| 28 | Admin categories page | PASS | `/admin/income-categories` загружается |
| 29 | Category create/edit/delete | PASS | CRUD пустой категории работает |
| 30 | Cannot delete used category | PASS | Backend вернул `400` |
| 31 | Admin tax rules page | PASS | `/admin/tax-rules` загружается |
| 32 | Tax rule create/edit/delete | PASS | CRUD тестового правила работает |
| 33 | Admin audit logs page | PASS | `/admin/audit-logs` загружается |
| 34 | Audit logs API | PASS | Записи журнала возвращаются |
| 35 | Audit logs filters | PASS | Фильтр по action работает |
| 36 | Swagger UI | PASS | `/api/docs` загружается |
| 37 | Smoke API | PASS | `Smoke API checks passed` |

## Найденные проблемы

Критичных проблем не найдено.

Наблюдения:

- Browser-плагин Codex был недоступен, поэтому проверка выполнена через установленный Microsoft Edge в headless-режиме.
- Полный ручной click-through с визуальной оценкой человеком все равно рекомендуется перед защитой.

## Исправленные проблемы

- Добавлено более единое форматирование денег, дат, ролей, типов доходов и audit actions.
- Обновлен `.gitignore`: добавлен `*.log`.
- Подготовлены финальные docs и screenshots plan.

## Скриншоты

Скриншоты сохранены в:

```text
docs/screenshots/
```

Список:

- `01-home.png`
- `02-login.png`
- `03-register.png`
- `04-dashboard.png`
- `05-incomes.png`
- `06-income-create.png`
- `07-tax-calculate.png`
- `08-tax-history.png`
- `09-reports.png`
- `10-admin-home.png`
- `11-admin-users.png`
- `12-admin-categories.png`
- `13-admin-tax-rules.png`
- `14-admin-audit-logs.png`
- `15-swagger.png`

## Build и smoke

| Check | Result | Notes |
|---|---|---|
| Backend build | PASS | `npm run build` |
| Prisma generate | PASS | `npm run prisma:generate` |
| Smoke API | PASS | `npm run smoke:api` |
| Frontend build | PASS | `npm run build` |

## Что осталось проверить вручную

- Финально открыть проект в обычном браузере, не headless.
- Пройти визуально все страницы из `docs/screenshots_plan.md`.
- Проверить, что скриншоты подходят по качеству и масштабу для дипломного текста.
