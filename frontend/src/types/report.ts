import type { Income } from "./income";
import type { TaxCalculation } from "./tax";

export type ReportPeriod = {
  type: "monthly" | "yearly" | "custom";
  year?: number;
  month?: number;
  dateFrom: string;
  dateTo: string;
};

export type ReportTotals = {
  incomeAmount: string;
  taxAmount: string;
  netAmount: string;
  incomeCount: number;
  taxCalculationCount: number;
};

export type ReportCategoryRow = {
  categoryId: string;
  categoryName: string;
  incomeType: string;
  incomeAmount: string;
  taxAmount: string;
  netAmount: string;
  incomeCount: number;
};

export type ReportIncomeTypeRow = {
  incomeType: string;
  incomeAmount: string;
  taxAmount: string;
  netAmount: string;
  incomeCount: number;
};

export type ReportMonthRow = {
  month: number;
  incomeAmount: string;
  taxAmount: string;
  netAmount: string;
  incomeCount: number;
  taxCalculationCount: number;
};

export type PeriodReport = {
  period: ReportPeriod;
  totals: ReportTotals;
  byCategory: ReportCategoryRow[];
  byIncomeType: ReportIncomeTypeRow[];
  latestIncomes: Income[];
  latestTaxCalculations: TaxCalculation[];
};

export type YearlyReport = {
  period: ReportPeriod;
  totals: ReportTotals;
  byMonth: ReportMonthRow[];
  byCategory: ReportCategoryRow[];
  byIncomeType: ReportIncomeTypeRow[];
};

export type MonthlyReportParams = {
  year: number;
  month: number;
};

export type YearlyReportParams = {
  year: number;
};

export type PeriodReportParams = {
  dateFrom: string;
  dateTo: string;
};
