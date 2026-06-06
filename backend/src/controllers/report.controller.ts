import { RequestHandler } from "express";
import { ZodError } from "zod";
import {
  monthlyReportQuerySchema,
  periodReportQuerySchema,
  yearlyReportQuerySchema
} from "../schemas/report.schema";
import {
  getCustomPeriodReport,
  getMonthlyReport,
  getYearlyReport
} from "../services/report.service";
import {
  buildPeriodReportCsv,
  buildYearlyReportCsv
} from "../utils/csv";
import { createValidationError } from "../utils/validation";

function getActor(req: Parameters<RequestHandler>[0]) {
  return {
    id: req.user!.id,
    role: req.user!.role
  };
}

export const getMonthlyReportHandler: RequestHandler = async (req, res, next) => {
  try {
    const query = monthlyReportQuerySchema.parse(req.query);
    const report = await getMonthlyReport(getActor(req), query.year, query.month);
    res.json({ report });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const getYearlyReportHandler: RequestHandler = async (req, res, next) => {
  try {
    const query = yearlyReportQuerySchema.parse(req.query);
    const report = await getYearlyReport(getActor(req), query.year);
    res.json({ report });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const getPeriodReportHandler: RequestHandler = async (req, res, next) => {
  try {
    const query = periodReportQuerySchema.parse(req.query);
    const report = await getCustomPeriodReport(
      getActor(req),
      query.dateFrom,
      query.dateTo
    );
    res.json({ report });
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const exportMonthlyReportHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const query = monthlyReportQuerySchema.parse(req.query);
    const report = await getMonthlyReport(getActor(req), query.year, query.month);
    const csv = buildPeriodReportCsv(report);
    const month = String(query.month).padStart(2, "0");

    sendCsv(
      res,
      csv,
      `taxflow-monthly-report-${query.year}-${month}.csv`
    );
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const exportYearlyReportHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const query = yearlyReportQuerySchema.parse(req.query);
    const report = await getYearlyReport(getActor(req), query.year);
    const csv = buildYearlyReportCsv(report);

    sendCsv(res, csv, `taxflow-yearly-report-${query.year}.csv`);
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

export const exportPeriodReportHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const query = periodReportQuerySchema.parse(req.query);
    const report = await getCustomPeriodReport(
      getActor(req),
      query.dateFrom,
      query.dateTo
    );
    const csv = buildPeriodReportCsv(report);
    const dateFrom = toDateName(query.dateFrom);
    const dateTo = toDateName(query.dateTo);

    sendCsv(
      res,
      csv,
      `taxflow-period-report-${dateFrom}_to_${dateTo}.csv`
    );
  } catch (error) {
    if (error instanceof ZodError) {
      next(createValidationError(error));
      return;
    }

    next(error);
  }
};

function sendCsv(
  res: Parameters<RequestHandler>[1],
  csv: string,
  filename: string
) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.send(csv);
}

function toDateName(value: Date) {
  return value.toISOString().slice(0, 10);
}


