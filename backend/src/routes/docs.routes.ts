import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger";

export const docsRouter = Router();

docsRouter.use("/", swaggerUi.serve);
docsRouter.get("/", swaggerUi.setup(swaggerSpec));
