# Test Cases

| № | Module | Scenario | Steps | Expected Result | Status |
|---:|---|---|---|---|---|
| 1 | Auth | Регистрация с валидными данными | Открыть `/register`, заполнить форму | Пользователь создан, переход на dashboard | Ready |
| 2 | Auth | Регистрация с неверным email | Ввести некорректный email | Показана ошибка валидации | Ready |
| 3 | Auth | Login demo user | Войти как `user@banktax.local` | Открыт `/dashboard` | Ready |
| 4 | Auth | Login с неверным паролем | Ввести неправильный пароль | Показана ошибка входа | Ready |
| 5 | Auth | Logout | Нажать `Выйти` | Cookie очищена, переход на `/login` | Ready |
| 6 | Role Access | Dashboard без cookie | Открыть `/dashboard` без авторизации | Redirect на `/login` | Ready |
| 7 | Role Access | USER открывает admin page | Войти как USER, открыть `/admin/users` | Показан отказ в доступе | Ready |
| 8 | Role Access | USER вызывает `/api/users` | GET `/api/users` с USER cookie | Ответ `403` | Ready |
| 9 | Incomes | Создание дохода | Открыть `/dashboard/incomes/new`, заполнить форму | Доход создан и виден в списке | Ready |
| 10 | Incomes | Валидация суммы | Ввести сумму `0` | Форма/API возвращает ошибку | Ready |
| 11 | Incomes | Редактирование дохода | Открыть edit page, изменить описание | Данные обновлены | Ready |
| 12 | Incomes | Удаление дохода | Нажать удалить и подтвердить | Запись удалена | Ready |
| 13 | Incomes | Фильтр по категории | Выбрать категорию | Список отфильтрован | Ready |
| 14 | Categories | Admin создает категорию | `/admin/income-categories`, заполнить форму | Категория создана | Ready |
| 15 | Categories | Admin меняет incomeType | Изменить тип категории | Категория обновлена | Ready |
| 16 | Categories | Удаление используемой категории | Удалить категорию с доходами | Ответ `400`, показана ошибка | Ready |
| 17 | Tax Rules | Admin создает правило | `/admin/tax-rules`, заполнить форму | Правило создано | Ready |
| 18 | Tax Rules | Валидация ставки | Ввести ставку больше 100 | Показана ошибка | Ready |
| 19 | Tax Calculation | Автоматический расчет | Выбрать доход на `/dashboard/taxes` | Backend выбрал правило и сохранил расчет | Ready |
| 20 | Tax Calculation | Нет подходящего правила | Деактивировать все правила типа | API возвращает понятную ошибку | Ready |
| 21 | Tax History | Просмотр истории | Открыть `/dashboard/taxes/history` | Таблица расчетов отображается | Ready |
| 22 | Tax History | Удаление расчета | Удалить расчет | Запись удалена, доход остается | Ready |
| 23 | Reports | Месячный отчет | Сформировать month/year | Показаны totals, таблицы и графики | Ready |
| 24 | Reports | Годовой отчет | Сформировать yearly | `byMonth` содержит 12 месяцев | Ready |
| 25 | Reports | Произвольный период | Указать `dateFrom/dateTo` | Показан отчет за период | Ready |
| 26 | Dashboard | Dashboard summary | Открыть `/dashboard` | Карточки и графики загружены | Ready |
| 27 | Admin Users | Изменение пользователя | Изменить `fullName` пользователя | Пользователь обновлен, audit log создан | Ready |
| 28 | Admin Users | Последнего admin нельзя понизить | Понизить единственного ADMIN | Ответ `400` | Ready |
| 29 | Audit Logs | Просмотр журнала | Открыть `/admin/audit-logs` | Записи показаны, фильтры работают | Ready |
| 30 | Swagger | Открытие документации | Открыть `/api/docs` | Swagger UI доступен | Ready |
| 31 | Smoke API | Запуск smoke script | `npm run smoke:api` | Скрипт завершился успешно | Ready |
| 32 | Smart Tax Rules | Admin creates FIXED rule | Open `/admin/tax-rules`, choose FIXED and save | Global fixed rule is created | Ready |
| 33 | Smart Tax Rules | Admin creates PROGRESSIVE rule | Open `/admin/tax-rules`, choose PROGRESSIVE, fill threshold and extra rate | Global progressive rule is created | Ready |
| 34 | My Tax Rules | User creates custom FIXED rule | Open `/dashboard/my-tax-rules`, create fixed rule | Rule is saved with owner and appears in list | Ready |
| 35 | My Tax Rules | User creates custom PROGRESSIVE rule | Fill threshold and extra rate on `/dashboard/my-tax-rules` | Rule is saved and validates required fields | Ready |
| 36 | Tax Calculation | Auto uses custom rule first | Create active custom rule for income type, calculate tax | Result uses badge "Моя ставка" and custom rate | Ready |
| 37 | Tax Calculation | Progressive salary above threshold | Create salary income above `36762500`, calculate tax | Base part uses 10%, excess uses 15% | Ready |
| 38 | Tax Calculation | Dividends progressive rule | Create dividend income above `994750000`, calculate tax | Base part uses 5%, excess uses 15% | Ready |
| 39 | Access Control | User cannot use another user's custom rule | Call manual calculate with another user's custom `taxRuleId` | API returns `403` | Ready |
