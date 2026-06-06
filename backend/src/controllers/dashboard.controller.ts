import { RequestHandler } from "express";
import { getDashboardSummary } from "../services/dashboard.service";

function getActor(req: Parameters<RequestHandler>[0]) {
  return {
    id: req.user!.id,
    role: req.user!.role
  };
}

export const getDashboardSummaryHandler: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const summary = await getDashboardSummary(getActor(req));
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};
