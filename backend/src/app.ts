import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

export const app = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

app.use("/api/health", healthRouter);

app.use("/api", notFoundHandler);
app.use(errorHandler);
