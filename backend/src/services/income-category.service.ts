import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { createAuditLog } from "./audit-log.service";
import type {
  CreateIncomeCategoryInput,
  UpdateIncomeCategoryInput
} from "../schemas/income-category.schema";

export async function getIncomeCategories() {
  return prisma.incomeCategory.findMany({
    orderBy: { name: "asc" }
  });
}

export async function createIncomeCategory(
  data: CreateIncomeCategoryInput,
  actorUserId: string
) {
  const existingCategory = await prisma.incomeCategory.findUnique({
    where: { name: data.name }
  });

  if (existingCategory) {
    throw new ApiError(409, "Income category with this name already exists");
  }

  const category = await prisma.incomeCategory.create({
    data: {
      name: data.name,
      description: data.description || null,
      incomeType: data.incomeType
    }
  });

  await createAuditLog({
    userId: actorUserId,
    action: "CREATE_INCOME_CATEGORY",
    entity: "IncomeCategory",
    entityId: category.id
  });

  return category;
}

export async function updateIncomeCategory(
  id: string,
  data: UpdateIncomeCategoryInput,
  actorUserId: string
) {
  const category = await prisma.incomeCategory.findUnique({
    where: { id }
  });

  if (!category) {
    throw new ApiError(404, "Income category not found");
  }

  if (data.name && data.name !== category.name) {
    const existingCategory = await prisma.incomeCategory.findUnique({
      where: { name: data.name }
    });

    if (existingCategory) {
      throw new ApiError(409, "Income category with this name already exists");
    }
  }

  const updatedCategory = await prisma.incomeCategory.update({
    where: { id },
    data: {
      name: data.name,
      incomeType: data.incomeType,
      description:
        data.description === undefined ? undefined : data.description || null
    }
  });

  await createAuditLog({
    userId: actorUserId,
    action: "UPDATE_INCOME_CATEGORY",
    entity: "IncomeCategory",
    entityId: updatedCategory.id
  });

  return updatedCategory;
}

export async function deleteIncomeCategory(id: string, actorUserId: string) {
  const category = await prisma.incomeCategory.findUnique({
    where: { id }
  });

  if (!category) {
    throw new ApiError(404, "Income category not found");
  }

  const relatedIncomeCount = await prisma.income.count({
    where: { categoryId: id }
  });

  if (relatedIncomeCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete category because it is used by income records"
    );
  }

  await prisma.incomeCategory.delete({
    where: { id }
  });

  await createAuditLog({
    userId: actorUserId,
    action: "DELETE_INCOME_CATEGORY",
    entity: "IncomeCategory",
    entityId: id
  });

  return { success: true };
}
