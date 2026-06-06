import type { User } from "./auth";

export type IncomeType =
  | "SALARY"
  | "FREELANCE"
  | "INVESTMENT"
  | "RENT"
  | "DIVIDENDS"
  | "PRIVATE_PRACTICE"
  | "ROYALTY"
  | "SALE_PROPERTY"
  | "OTHER";

export type IncomeCategory = {
  id: string;
  name: string;
  description: string | null;
  incomeType: IncomeType;
  createdAt: string;
  updatedAt: string;
};

export type Income = {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  currency: string;
  receivedAt: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  category: IncomeCategory;
  user?: Pick<User, "id" | "email" | "fullName" | "role">;
};

export type IncomeSummary = {
  totalAmount: string;
  count: number;
  currency: string;
  byCategory: Array<{
    categoryId: string;
    categoryName: string;
    totalAmount: string;
    count: number;
  }>;
};

export type IncomeFilters = {
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

export type CreateIncomePayload = {
  categoryId: string;
  amount: string;
  receivedAt: string;
  description?: string;
};

export type UpdateIncomePayload = Partial<CreateIncomePayload>;

export type CreateIncomeCategoryPayload = {
  name: string;
  description?: string;
  incomeType?: IncomeType;
};

export type UpdateIncomeCategoryPayload = Partial<CreateIncomeCategoryPayload>;
