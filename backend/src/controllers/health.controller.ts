import { Request, Response } from "express";

export const getHealth = (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "bank-tax-accounting-api",
    timestamp: new Date().toISOString()
  });
};
