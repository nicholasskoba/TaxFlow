import type { Income } from "./income";
import type { TaxCalculation } from "./tax";

export type DashboardSummary = {
  income: {
    totalAmount: string;
    currentMonthAmount: string;
    count: number;
  };
  tax: {
    totalTaxAmount: string;
    currentMonthTaxAmount: string;
    totalNetAmount: string;
    count: number;
  };
  charts: {
    monthly: Array<{
      month: string;
      incomeAmount: string;
      taxAmount: string;
      netAmount: string;
    }>;
    byCategory: Array<{
      categoryName: string;
      incomeAmount: string;
    }>;
    byIncomeType: Array<{
      incomeType: string;
      incomeAmount: string;
    }>;
  };
  latest: {
    incomes: Income[];
    taxCalculations: TaxCalculation[];
  };
};
