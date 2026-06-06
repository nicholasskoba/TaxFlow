import { CookieOptions, RequestHandler } from "express";
import { ZodError } from "zod";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import { loginUser, registerUser } from "../services/auth.service";
import { createValidationError } from "../utils/validation";

const TOKEN_COOKIE_NAME = "token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const tokenCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: TOKEN_MAX_AGE
};

export const register: RequestHandler = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const { user, token } = await registerUser(data);

    res.cookie(TOKEN_COOKIE_NAME, token, tokenCookieOptions);
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const { user, token } = await loginUser(data);

    res.cookie(TOKEN_COOKIE_NAME, token, tokenCookieOptions);
    res.json({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  res.json({ success: true });
};

export const me: RequestHandler = (req, res) => {
  res.json({ user: req.user });
};


