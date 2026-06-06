export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type RegisterUserInput = {
  fullName: string;
  email: string;
  password: string;
};

export type LoginUserInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: User;
};
