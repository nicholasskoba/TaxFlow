import bcrypt from "bcrypt";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { signJwt } from "../utils/jwt";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";

const PASSWORD_SALT_ROUNDS = 10;

export const publicUserSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
  updatedAt: true
} as const;

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(data.password, PASSWORD_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      passwordHash,
      role: UserRole.USER
    },
    select: publicUserSelect
  });

  const token = signJwt({ userId: user.id, role: user.role });

  return { user, token };
}

export async function loginUser(data: LoginInput) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!userWithPassword) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    userWithPassword.passwordHash
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userWithPassword.id },
    select: publicUserSelect
  });

  const token = signJwt({ userId: user.id, role: user.role });

  return { user, token };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  return user;
}
