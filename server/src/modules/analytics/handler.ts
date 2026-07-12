import { Request, Response, NextFunction } from "express";
import * as analyticsService from "./service.js";

export async function dashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, status, region } = req.query
    const kpis = await analyticsService.getDashboardKPIs({
      type: type as string,
      status: status as string,
      region: region as string,
    });
    res.json({ data: kpis });
  } catch (err) { next(err); }
}

export async function reports(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getReportsData();
    res.json({ data });
  } catch (err) { next(err); }
}

export async function exportCSV(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getReportsData();
    const csv = analyticsService.generateCSV(data.vehicles);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transitops-report.csv");
    res.send(csv);
  } catch (err) { next(err); }
}
