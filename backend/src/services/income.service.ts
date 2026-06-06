import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { createAuditLog } from "./audit-log.service";
import type {
  CreateIncomeInput,
  IncomeFiltersInput,
  UpdateIncomeInput
} from "../schemas/income.schema";

type Actor = {
  id: string;
  role: UserRole;
};

const incomeInclude = {
  category: true,
  user: {
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true
    }
  }
} as const;

function serializeIncome<T extends { amount: Prisma.Decimal }>(income: T) {
  return {
    ...income,
    amount: income.amount.toFixed(2),
    currency: "KZT"
  };
}

function buildIncomeWhere(actor: Actor, filters?: IncomeFiltersInput): Prisma.IncomeWhereInput {
  const where: Prisma.IncomeWhereInput = {};

  if (actor.role !== "ADMIN") {
    where.userId = actor.id;
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    const dateTo = filters.dateTo ? new Date(filters.dateTo) : undefined;

    if (dateTo) {
      dateTo.setHours(23, 59, 59, 999);
    }

    where.receivedAt = {
      gte: filters.dateFrom,
      lte: dateTo
    };
  }

  if (filters?.search) {
    where.description = {
      contains: filters.search,
      mode: "insensitive"
    };
  }

  return where;
}

async function ensureCategoryExists(categoryId: string) {
  const category = await prisma.incomeCategory.findUnique({
    where: { id: categoryId }
  });

  if (!category) {
    throw new ApiError(400, "Income category not found");
  }
}

async function getIncomeForActor(id: string, actor: Actor) {
  const income = await prisma.income.findUnique({
    where: { id },
    include: incomeInclude
  });

  if (!income) {
    throw new ApiError(404, "Income not found");
  }

  if (actor.role !== "ADMIN" && income.userId !== actor.id) {
    throw new ApiError(403, "Access denied");
  }

  return income;
}

export async function listIncomes(actor: Actor, filters: IncomeFiltersInput) {
  const incomes = await prisma.income.findMany({
    where: buildIncomeWhere(actor, filters),
    include: incomeInclude,
    orderBy: { receivedAt: "desc" }
  });

  return incomes.map(serializeIncome);
}

export async function getIncomeById(id: string, actor: Actor) {
  const income = await getIncomeForActor(id, actor);
  return serializeIncome(income);
}

export async function createIncome(data: CreateIncomeInput, actor: Actor) {
  await ensureCategoryExists(data.categoryId);

  const income = await prisma.income.create({
    data: {
      userId: actor.id,
      categoryId: data.categoryId,
      amount: data.amount,
      currency: "KZT",
      receivedAt: data.receivedAt,
      description: data.description || null
    },
    include: incomeInclude
  });

  await createAuditLog({
    userId: actor.id,
    action: "CREATE_INCOME",
    entity: "Income",
    entityId: income.id
  });

  return serializeIncome(income);
}

export async function updateIncome(id: string, data: UpdateIncomeInput, actor: Actor) {
  await getIncomeForActor(id, actor);

  if (data.categoryId) {
    await ensureCategoryExists(data.categoryId);
  }

  const income = await prisma.income.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      amount: data.amount,
      receivedAt: data.receivedAt,
      description:
        data.description === undefined ? undefined : data.description || null
    },
    include: incomeInclude
  });

  await createAuditLog({
    userId: actor.id,
    action: "UPDATE_INCOME",
    entity: "Income",
    entityId: income.id
  });

  return serializeIncome(income);
}

export async function deleteIncome(id: string, actor: Actor) {
  await getIncomeForActor(id, actor);

  await prisma.income.delete({
    where: { id }
  });

  await createAuditLog({
    userId: actor.id,
    action: "DELETE_INCOME",
    entity: "Income",
    entityId: id
  });

  return { success: true };
}

export async function getIncomeSummary(actor: Actor) {
  const incomes = await prisma.income.findMany({
    where: buildIncomeWhere(actor),
    select: {
      amount: true,
      categoryId: true,
      category: {
        select: {
          name: true
        }
      }
    }
  });

  const totalAmount = incomes.reduce(
    (sum, income) => sum.plus(income.amount),
    new Prisma.Decimal(0)
  );

  const byCategoryMap = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      totalAmount: Prisma.Decimal;
      count: number;
    }
  >();

  for (const income of incomes) {
    const current = byCategoryMap.get(income.categoryId) ?? {
      categoryId: income.categoryId,
      categoryName: income.category.name,
      totalAmount: new Prisma.Decimal(0),
      count: 0
    };

    current.totalAmount = current.totalAmount.plus(income.amount);
    current.count += 1;
    byCategoryMap.set(income.categoryId, current);
  }

  return {
    totalAmount: totalAmount.toFixed(2),
    count: incomes.length,
    currency: "KZT",
    byCategory: Array.from(byCategoryMap.values()).map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      totalAmount: item.totalAmount.toFixed(2),
      count: item.count
    }))
  };
}
