import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userFiltersSchema = z.object({
  search: z.string().trim().optional(),
  role: z.nativeEnum(UserRole).optional()
});

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  role: z.nativeEnum(UserRole).optional()
});

export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
