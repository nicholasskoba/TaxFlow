import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { env } from "../config/env";

export type JwtPayload = {
  userId: string;
  role: UserRole;
};

const TOKEN_EXPIRES_IN = "7d";

export function signJwt(payload: JwtPayload) {
  const options: SignOptions = {
    expiresIn: TOKEN_EXPIRES_IN
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyJwt(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
