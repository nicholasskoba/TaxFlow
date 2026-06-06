import { RequestHandler } from "express";
import { getUserById } from "../services/auth.service";
import { ApiError } from "../utils/ApiError";
import { verifyJwt } from "../utils/jwt";

const TOKEN_COOKIE_NAME = "token";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.[TOKEN_COOKIE_NAME];

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const payload = verifyJwt(token);
    const user = await getUserById(payload.userId);

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Unauthorized"));
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user?.role !== "ADMIN") {
      next(new ApiError(403, "Admin access required"));
      return;
    }

    next();
  });
};
