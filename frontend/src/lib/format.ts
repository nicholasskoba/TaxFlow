import type { UserRole } from "@/types/auth";
import type { IncomeType } from "@/types/income";
import type { TaxRule, TaxRuleType } from "@/types/tax";

const incomeTypeLabels: Record<IncomeType, string> = {
  SALARY: "Заработная плата",
  FREELANCE: "Фриланс",
  INVESTMENT: "Инвестиции",
  RENT: "Аренда",
  DIVIDENDS: "Дивиденды",
  PRIVATE_PRACTICE: "Частная практика",
  ROYALTY: "Роялти",
  SALE_PROPERTY: "Продажа имущества",
  OTHER: "Прочие доходы"
};

export function formatMoney(value: string | number, currency = "KZT") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `0 ${currency}`;
  }

  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatIncomeType(value?: IncomeType | string | null) {
  if (!value) {
    return "-";
  }

  return incomeTypeLabels[value as IncomeType] ?? value;
}

export function formatTaxRuleType(value?: TaxRuleType | string | null) {
  if (value === "PROGRESSIVE") {
    return "Прогрессивная";
  }

  if (value === "FIXED") {
    return "Фиксированная";
  }

  return value || "-";
}

export function formatTaxRuleDescription(rule: Pick<TaxRule, "ruleType" | "rate" | "threshold" | "extraRate">) {
  if (rule.ruleType === "PROGRESSIVE") {
    return `${rule.rate}% до ${formatMoney(rule.threshold ?? "0.00")}, затем ${rule.extraRate ?? "0"}%`;
  }

  return `${rule.rate}%`;
}

export function formatRole(value?: UserRole | string | null) {
  if (value === "ADMIN") {
    return "Администратор";
  }

  if (value === "USER") {
    return "Пользователь";
  }

  return value || "-";
}

const actionLabels: Record<string, string> = {
  CREATE_INCOME: "Создание дохода",
  UPDATE_INCOME: "Изменение дохода",
  DELETE_INCOME: "Удаление дохода",
  CREATE_INCOME_CATEGORY: "Создание категории",
  UPDATE_INCOME_CATEGORY: "Изменение категории",
  DELETE_INCOME_CATEGORY: "Удаление категории",
  CREATE_TAX_RULE: "Создание налогового правила",
  UPDATE_TAX_RULE: "Изменение налогового правила",
  DELETE_TAX_RULE: "Удаление налогового правила",
  CREATE_SMART_TAX_RULE: "Создание умного правила",
  UPDATE_SMART_TAX_RULE: "Изменение умного правила",
  CREATE_CUSTOM_TAX_RULE: "Создание личной ставки",
  UPDATE_CUSTOM_TAX_RULE: "Изменение личной ставки",
  DELETE_CUSTOM_TAX_RULE: "Удаление личной ставки",
  CALCULATE_TAX: "Ручной расчёт налога",
  CALCULATE_TAX_AUTO: "Автоматический расчёт налога",
  DELETE_TAX_CALCULATION: "Удаление расчёта налога",
  UPDATE_USER: "Изменение пользователя"
};

export function formatAction(value?: string | null) {
  if (!value) {
    return "-";
  }

  return actionLabels[value] ?? value;
}

const entityLabels: Record<string, string> = {
  User: "Пользователь",
  Income: "Доход",
  IncomeCategory: "Категория доходов",
  TaxRule: "Налоговое правило",
  TaxCalculation: "Расчёт налога",
  Auth: "Авторизация"
};

export function formatEntity(value?: string | null) {
  if (!value) {
    return "-";
  }

  return entityLabels[value] ?? value;
}
