import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { auditLogRouter } from "./routes/audit-log.routes";
import { docsRouter } from "./routes/docs.routes";
import { healthRouter } from "./routes/health.routes";
import { incomeCategoryRouter } from "./routes/income-category.routes";
import { incomeRouter } from "./routes/income.routes";
import { myTaxRuleRouter } from "./routes/my-tax-rule.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { reportRouter } from "./routes/report.routes";
import { taxCalculationRouter } from "./routes/tax-calculation.routes";
import { taxRuleRouter } from "./routes/tax-rule.routes";
import { userRouter } from "./routes/user.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { apiLimiter, authLimiter } from "./middleware/rate-limit.middleware";

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api", apiLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/docs", docsRouter);
app.use("/api/auth", authRouter);
app.use("/api/health", healthRouter);
app.use("/api/income-categories", incomeCategoryRouter);
app.use("/api/incomes", incomeRouter);
app.use("/api/tax-rules", taxRuleRouter);
app.use("/api/my-tax-rules", myTaxRuleRouter);
app.use("/api/tax-calculations", taxCalculationRouter);
app.use("/api/reports", reportRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", userRouter);
app.use("/api/audit-logs", auditLogRouter);

app.use("/api", notFoundHandler);
app.use(errorHandler);
