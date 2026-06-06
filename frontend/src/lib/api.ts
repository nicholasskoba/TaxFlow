import type { HealthResponse } from "@/types/health";
import type { DashboardSummary } from "@/types/dashboard";
import type {
  AuthResponse,
  LoginUserInput,
  RegisterUserInput
} from "@/types/auth";
import type {
  CreateIncomeCategoryPayload,
  CreateIncomePayload,
  Income,
  IncomeCategory,
  IncomeFilters,
  IncomeSummary,
  UpdateIncomeCategoryPayload,
  UpdateIncomePayload
} from "@/types/income";
import type {
  CalculateTaxAutoPayload,
  CalculateTaxPayload,
  CreateMyTaxRulePayload,
  CreateTaxRulePayload,
  TaxCalculation,
  TaxCalculationFilters,
  TaxCalculationSummary,
  TaxRule,
  UpdateMyTaxRulePayload,
  UpdateTaxRulePayload
} from "@/types/tax";
import type {
  MonthlyReportParams,
  PeriodReport,
  PeriodReportParams,
  YearlyReport,
  YearlyReportParams
} from "@/types/report";
import type {
  AdminUser,
  UpdateUserPayload,
  UserFilters
} from "@/types/user";
import type { AuditLog, AuditLogFilters } from "@/types/audit-log";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.message === "string"
        ? errorBody.message
        : `API request failed with status ${response.status}`;

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function downloadFile(path: string, filename: string) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include"
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      typeof errorBody?.message === "string"
        ? errorBody.message
        : `Не удалось скачать файл`;

    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function getHealth() {
  return request<HealthResponse>("/health");
}

export function registerUser(data: RegisterUserInput) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function loginUser(data: LoginUserInput) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function logoutUser() {
  return request<{ success: boolean }>("/auth/logout", {
    method: "POST"
  });
}

export function getCurrentUser() {
  return request<AuthResponse>("/auth/me", {
    cache: "no-store"
  });
}

export function getIncomeCategories() {
  return request<{ categories: IncomeCategory[] }>("/income-categories", {
    cache: "no-store"
  });
}

export function createIncomeCategory(data: CreateIncomeCategoryPayload) {
  return request<{ category: IncomeCategory }>("/income-categories", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateIncomeCategory(
  id: string,
  data: UpdateIncomeCategoryPayload
) {
  return request<{ category: IncomeCategory }>(`/income-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

export function deleteIncomeCategory(id: string) {
  return request<{ success: boolean }>(`/income-categories/${id}`, {
    method: "DELETE"
  });
}

function buildIncomeQuery(filters?: IncomeFilters) {
  const params = new URLSearchParams();

  if (filters?.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  if (filters?.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters?.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters?.search) {
    params.set("search", filters.search);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getIncomes(filters?: IncomeFilters) {
  return request<{ incomes: Income[] }>(`/incomes${buildIncomeQuery(filters)}`, {
    cache: "no-store"
  });
}

export function getIncomeById(id: string) {
  return request<{ income: Income }>(`/incomes/${id}`, {
    cache: "no-store"
  });
}

export function createIncome(data: CreateIncomePayload) {
  return request<{ income: Income }>("/incomes", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateIncome(id: string, data: UpdateIncomePayload) {
  return request<{ income: Income }>(`/incomes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

export function deleteIncome(id: string) {
  return request<{ success: boolean }>(`/incomes/${id}`, {
    method: "DELETE"
  });
}

export function getIncomeSummary() {
  return request<{ summary: IncomeSummary }>("/incomes/summary", {
    cache: "no-store"
  });
}

export function getTaxRules() {
  return request<{ taxRules: TaxRule[] }>("/tax-rules", {
    cache: "no-store"
  });
}

export function getTaxRuleById(id: string) {
  return request<{ taxRule: TaxRule }>(`/tax-rules/${id}`, {
    cache: "no-store"
  });
}

export function createTaxRule(data: CreateTaxRulePayload) {
  return request<{ taxRule: TaxRule }>("/tax-rules", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateTaxRule(id: string, data: UpdateTaxRulePayload) {
  return request<{ taxRule: TaxRule }>(`/tax-rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

export function deleteTaxRule(id: string) {
  return request<{ success: boolean; deactivated?: boolean }>(`/tax-rules/${id}`, {
    method: "DELETE"
  });
}

export function getMyTaxRules() {
  return request<{ taxRules: TaxRule[] }>("/my-tax-rules", {
    cache: "no-store"
  });
}

export function createMyTaxRule(data: CreateMyTaxRulePayload) {
  return request<{ taxRule: TaxRule }>("/my-tax-rules", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateMyTaxRule(id: string, data: UpdateMyTaxRulePayload) {
  return request<{ taxRule: TaxRule }>(`/my-tax-rules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

export function deleteMyTaxRule(id: string) {
  return request<{ success: boolean; deactivated?: boolean }>(
    `/my-tax-rules/${id}`,
    {
      method: "DELETE"
    }
  );
}

function buildTaxCalculationQuery(filters?: TaxCalculationFilters) {
  const params = new URLSearchParams();

  if (filters?.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters?.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters?.taxRuleId) {
    params.set("taxRuleId", filters.taxRuleId);
  }

  if (filters?.incomeId) {
    params.set("incomeId", filters.incomeId);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function calculateTax(data: CalculateTaxPayload) {
  return request<{ taxCalculation: TaxCalculation }>("/tax-calculations/calculate", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function calculateTaxAuto(data: CalculateTaxAutoPayload) {
  return request<{ taxCalculation: TaxCalculation }>(
    "/tax-calculations/calculate-auto",
    {
      method: "POST",
      body: JSON.stringify(data)
    }
  );
}

export function getTaxCalculations(filters?: TaxCalculationFilters) {
  return request<{ taxCalculations: TaxCalculation[] }>(
    `/tax-calculations${buildTaxCalculationQuery(filters)}`,
    {
      cache: "no-store"
    }
  );
}

export function getTaxCalculationById(id: string) {
  return request<{ taxCalculation: TaxCalculation }>(`/tax-calculations/${id}`, {
    cache: "no-store"
  });
}

export function deleteTaxCalculation(id: string) {
  return request<{ success: boolean }>(`/tax-calculations/${id}`, {
    method: "DELETE"
  });
}

export function getTaxCalculationSummary() {
  return request<{ summary: TaxCalculationSummary }>("/tax-calculations/summary", {
    cache: "no-store"
  });
}

export function getDashboardSummary() {
  return request<{ summary: DashboardSummary }>("/dashboard/summary", {
    cache: "no-store"
  });
}

export function getMonthlyReport(params: MonthlyReportParams) {
  const query = new URLSearchParams({
    year: String(params.year),
    month: String(params.month)
  });

  return request<{ report: PeriodReport }>(`/reports/monthly?${query}`, {
    cache: "no-store"
  });
}

export function downloadMonthlyReportCsv(params: MonthlyReportParams) {
  const query = new URLSearchParams({
    year: String(params.year),
    month: String(params.month)
  });
  const month = String(params.month).padStart(2, "0");

  return downloadFile(
    `/reports/monthly/export?${query}`,
    `taxflow-monthly-report-${params.year}-${month}.csv`
  );
}

export function getYearlyReport(params: YearlyReportParams) {
  const query = new URLSearchParams({
    year: String(params.year)
  });

  return request<{ report: YearlyReport }>(`/reports/yearly?${query}`, {
    cache: "no-store"
  });
}

export function downloadYearlyReportCsv(params: YearlyReportParams) {
  const query = new URLSearchParams({
    year: String(params.year)
  });

  return downloadFile(
    `/reports/yearly/export?${query}`,
    `taxflow-yearly-report-${params.year}.csv`
  );
}

export function getPeriodReport(params: PeriodReportParams) {
  const query = new URLSearchParams({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo
  });

  return request<{ report: PeriodReport }>(`/reports/period?${query}`, {
    cache: "no-store"
  });
}

export function downloadPeriodReportCsv(params: PeriodReportParams) {
  const query = new URLSearchParams({
    dateFrom: params.dateFrom,
    dateTo: params.dateTo
  });

  return downloadFile(
    `/reports/period/export?${query}`,
    `taxflow-period-report-${params.dateFrom}_to_${params.dateTo}.csv`
  );
}

function buildUserQuery(filters?: UserFilters) {
  const params = new URLSearchParams();

  if (filters?.search) {
    params.set("search", filters.search);
  }

  if (filters?.role) {
    params.set("role", filters.role);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getUsers(filters?: UserFilters) {
  return request<{ users: AdminUser[] }>(`/users${buildUserQuery(filters)}`, {
    cache: "no-store"
  });
}

export function getUserById(id: string) {
  return request<{ user: AdminUser }>(`/users/${id}`, {
    cache: "no-store"
  });
}

export function updateUser(id: string, data: UpdateUserPayload) {
  return request<{ user: AdminUser }>(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

function buildAuditLogQuery(filters?: AuditLogFilters) {
  const params = new URLSearchParams();

  if (filters?.action) {
    params.set("action", filters.action);
  }

  if (filters?.entity) {
    params.set("entity", filters.entity);
  }

  if (filters?.userId) {
    params.set("userId", filters.userId);
  }

  if (filters?.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters?.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters?.limit) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function getAuditLogs(filters?: AuditLogFilters) {
  return request<{ auditLogs: AuditLog[] }>(
    `/audit-logs${buildAuditLogQuery(filters)}`,
    {
      cache: "no-store"
    }
  );
}

export function getAuditLogById(id: string) {
  return request<{ auditLog: AuditLog }>(`/audit-logs/${id}`, {
    cache: "no-store"
  });
}
