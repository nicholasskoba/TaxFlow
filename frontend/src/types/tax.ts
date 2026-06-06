import type { User } from "./auth";
import type { Income, IncomeType } from "./income";

export type { IncomeType };

export type TaxRuleType = "FIXED" | "PROGRESSIVE";

export type TaxRule = {
  id: string;
  name: string;
  rate: string;
  ruleType: TaxRuleType;
  threshold: string | null;
  extraRate: string | null;
  incomeType: IncomeType;
  isActive: boolean;
  isCustom: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaxCalculationBreakdown = {
  appliedRateLabel: string;
  baseTaxAmount: string;
  extraTaxAmount: string;
  threshold: string | null;
  extraRate: string | null;
};

export type TaxCalculation = {
  id: string;
  userId: string;
  incomeId: string;
  taxRuleId: string;
  incomeAmount: string;
  taxRate: string;
  taxAmount: string;
  netAmount: string;
  breakdown?: TaxCalculationBreakdown;
  calculatedAt: string;
  income: Income;
  taxRule: TaxRule;
  user?: Pick<User, "id" | "email" | "fullName" | "role">;
};

export type TaxCalculationSummary = {
  totalIncomeAmount: string;
  totalTaxAmount: string;
  totalNetAmount: string;
  count: number;
  currency: string;
  byRule: Array<{
    taxRuleId: string;
    taxRuleName: string;
    taxRate: string;
    totalTaxAmount: string;
    count: number;
  }>;
};

export type CreateTaxRulePayload = {
  name: string;
  rate: string;
  incomeType: IncomeType;
  ruleType: TaxRuleType;
  threshold?: string | null;
  extraRate?: string | null;
  isActive: boolean;
};

export type UpdateTaxRulePayload = Partial<CreateTaxRulePayload>;

export type CreateMyTaxRulePayload = CreateTaxRulePayload;
export type UpdateMyTaxRulePayload = UpdateTaxRulePayload;

export type CalculateTaxPayload = {
  incomeId: string;
  taxRuleId: string;
};

export type CalculateTaxAutoPayload = {
  incomeId: string;
};

export type TaxCalculationFilters = {
  dateFrom?: string;
  dateTo?: string;
  taxRuleId?: string;
  incomeId?: string;
};
