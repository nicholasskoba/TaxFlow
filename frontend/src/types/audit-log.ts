import type { UserRole } from "./auth";

export type AuditLogUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user?: AuditLogUser | null;
};

export type AuditLogFilters = {
  action?: string;
  entity?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
};
