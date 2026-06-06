import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import type { AuditLogFiltersInput } from "../schemas/audit-log.schema";

type AuditLogInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
};

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId
}: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId
    }
  });
}

function buildAuditLogWhere(filters: AuditLogFiltersInput) {
  const where: {
    action?: string;
    entity?: string;
    userId?: string;
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
  } = {};

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.entity) {
    where.entity = filters.entity;
  }

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.dateFrom || filters.dateTo) {
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : undefined;

    if (dateTo) {
      dateTo.setHours(23, 59, 59, 999);
    }

    where.createdAt = {
      gte: filters.dateFrom,
      lte: dateTo
    };
  }

  return where;
}

const auditLogInclude = {
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true
    }
  }
} as const;

export async function listAuditLogs(filters: AuditLogFiltersInput) {
  return prisma.auditLog.findMany({
    where: buildAuditLogWhere(filters),
    include: auditLogInclude,
    orderBy: { createdAt: "desc" },
    take: filters.limit
  });
}

export async function getAuditLogById(id: string) {
  const auditLog = await prisma.auditLog.findUnique({
    where: { id },
    include: auditLogInclude
  });

  if (!auditLog) {
    throw new ApiError(404, "Audit log not found");
  }

  return auditLog;
}
