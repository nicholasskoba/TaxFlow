import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { createAuditLog } from "./audit-log.service";
import type { UpdateUserInput, UserFiltersInput } from "../schemas/user.schema";

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
  updatedAt: true
} as const;

type Actor = {
  id: string;
  role: UserRole;
};

function buildUserWhere(filters: UserFiltersInput): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.search) {
    where.OR = [
      {
        email: {
          contains: filters.search,
          mode: "insensitive"
        }
      },
      {
        fullName: {
          contains: filters.search,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
}

export async function listUsers(filters: UserFiltersInput) {
  return prisma.user.findMany({
    where: buildUserWhere(filters),
    select: userSelect,
    orderBy: { createdAt: "desc" }
  });
}

export async function getUserByIdForAdmin(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...userSelect,
      _count: {
        select: {
          incomes: true,
          taxCalculations: true
        }
      }
    }
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return {
    ...user,
    incomesCount: user._count.incomes,
    taxCalculationsCount: user._count.taxCalculations,
    _count: undefined
  };
}

export async function updateUser(id: string, data: UpdateUserInput, actor: Actor) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "ADMIN" && data.role === "USER") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" }
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "Cannot demote the last admin user");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      fullName: data.fullName,
      role: data.role
    },
    select: userSelect
  });

  await createAuditLog({
    userId: actor.id,
    action: "UPDATE_USER",
    entity: "User",
    entityId: updatedUser.id
  });

  return updatedUser;
}
