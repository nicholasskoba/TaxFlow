import { Router } from "express";
import {
  getUserByIdHandler,
  listUsersHandler,
  updateUserHandler
} from "../controllers/user.controller";
import { requireAdmin } from "../middleware/auth.middleware";

export const userRouter = Router();

userRouter.use(requireAdmin);

userRouter.get("/", listUsersHandler);
userRouter.get("/:id", getUserByIdHandler);
userRouter.patch("/:id", updateUserHandler);
