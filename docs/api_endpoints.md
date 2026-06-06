# API Endpoints

| Module | Method | Endpoint | Description | Access |
|---|---:|---|---|---|
| Health | GET | `/api/health` | Проверка состояния API | Public |
| Auth | POST | `/api/auth/register` | Регистрация пользователя | Public |
| Auth | POST | `/api/auth/login` | Вход пользователя | Public |
| Auth | POST | `/api/auth/logout` | Выход и очистка cookie | Authenticated |
| Auth | GET | `/api/auth/me` | Текущий пользователь | Authenticated |
| Users | GET | `/api/users` | Список пользователей | ADMIN |
| Users | GET | `/api/users/:id` | Пользователь и краткая статистика | ADMIN |
| Users | PATCH | `/api/users/:id` | Изменение имени или роли | ADMIN |
| Income Categories | GET | `/api/income-categories` | Список категорий | Authenticated |
| Income Categories | POST | `/api/income-categories` | Создание категории | ADMIN |
| Income Categories | PATCH | `/api/income-categories/:id` | Изменение категории | ADMIN |
| Income Categories | DELETE | `/api/income-categories/:id` | Удаление категории | ADMIN |
| Incomes | GET | `/api/incomes` | Список доходов с фильтрами | Authenticated |
| Incomes | GET | `/api/incomes/summary` | Сводка доходов | Authenticated |
| Incomes | POST | `/api/incomes` | Создание дохода | Authenticated |
| Incomes | GET | `/api/incomes/:id` | Доход по id | Owner or ADMIN |
| Incomes | PATCH | `/api/incomes/:id` | Изменение дохода | Owner or ADMIN |
| Incomes | DELETE | `/api/incomes/:id` | Удаление дохода | Owner or ADMIN |
| Tax Rules | GET | `/api/tax-rules` | Список налоговых правил | Authenticated |
| Tax Rules | GET | `/api/tax-rules/:id` | Налоговое правило по id | Authenticated |
| Tax Rules | POST | `/api/tax-rules` | Создание правила | ADMIN |
| Tax Rules | PATCH | `/api/tax-rules/:id` | Изменение правила | ADMIN |
| Tax Rules | DELETE | `/api/tax-rules/:id` | Удаление или деактивация правила | ADMIN |
| My Tax Rules | GET | `/api/my-tax-rules` | Список личных налоговых ставок | Authenticated |
| My Tax Rules | POST | `/api/my-tax-rules` | Создание личной налоговой ставки | Authenticated |
| My Tax Rules | PATCH | `/api/my-tax-rules/:id` | Изменение личной налоговой ставки | Owner |
| My Tax Rules | DELETE | `/api/my-tax-rules/:id` | Удаление или деактивация личной ставки | Owner |
| Tax Calculations | POST | `/api/tax-calculations/calculate-auto` | Автоматический расчет налога | Authenticated |
| Tax Calculations | POST | `/api/tax-calculations/calculate` | Ручной расчет с проверкой типа | Authenticated |
| Tax Calculations | GET | `/api/tax-calculations` | История расчетов | Authenticated |
| Tax Calculations | GET | `/api/tax-calculations/summary` | Сводка расчетов | Authenticated |
| Tax Calculations | GET | `/api/tax-calculations/:id` | Расчет по id | Owner or ADMIN |
| Tax Calculations | DELETE | `/api/tax-calculations/:id` | Удаление расчета | Owner or ADMIN |
| Reports | GET | `/api/reports/monthly` | Месячный отчет | Authenticated |
| Reports | GET | `/api/reports/monthly/export` | Экспорт месячного отчета в CSV | Authenticated |
| Reports | GET | `/api/reports/yearly` | Годовой отчет | Authenticated |
| Reports | GET | `/api/reports/yearly/export` | Экспорт годового отчета в CSV | Authenticated |
| Reports | GET | `/api/reports/period` | Отчет за период | Authenticated |
| Reports | GET | `/api/reports/period/export` | Экспорт отчета за период в CSV | Authenticated |
| Dashboard | GET | `/api/dashboard/summary` | Dashboard summary | Authenticated |
| Audit Logs | GET | `/api/audit-logs` | Список audit log | ADMIN |
| Audit Logs | GET | `/api/audit-logs/:id` | Запись audit log | ADMIN |

## Amounts

All financial amounts are stored and calculated in KZT. Income create/update payloads contain `amount`, `categoryId`, `receivedAt` and optional `description`; currency selection is not part of the public API.

## Income Types

Income categories and tax rules use the same `incomeType` values:

| IncomeType | Display name | Reference rate |
|---|---|---:|
| `SALARY` | Заработная плата | 10% |
| `FREELANCE` | Фриланс | 10% |
| `INVESTMENT` | Инвестиции | 10% |
| `RENT` | Аренда | 10% |
| `DIVIDENDS` | Дивиденды | 5% |
| `PRIVATE_PRACTICE` | Частная практика | 9% |
| `ROYALTY` | Роялти | 10% |
| `SALE_PROPERTY` | Продажа имущества | 10% |
| `OTHER` | Прочие доходы | 10% |

The rates are reference demo rules for calculation logic. `PROGRESSIVE` rules are implemented as a simplified per-income calculation with a threshold and an extra rate. Accumulated annual income, deductions and individual exemptions are not implemented in this stage.

## Tax Rule Types

| Rule type | Description |
|---|---|
| `FIXED` | Calculates tax as `income.amount * rate / 100`. |
| `PROGRESSIVE` | Applies `rate` up to `threshold` and `extraRate` to the amount above `threshold`. |

Personal custom rules are stored with `isCustom = true` and `userId`. Automatic calculation first uses a matching active personal rule for the income owner, then falls back to the global active rule. The progressive formula is simplified and applies to the selected income amount.
