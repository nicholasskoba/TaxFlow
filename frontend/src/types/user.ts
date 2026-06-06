import type { UserRole } from "./auth";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  incomesCount?: number;
  taxCalculationsCount?: number;
};

export type UserFilters = {
  search?: string;
  role?: UserRole | "";
};

export type UpdateUserPayload = {
  fullName?: string;
  role?: UserRole;
};
