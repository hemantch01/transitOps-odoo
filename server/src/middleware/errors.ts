import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        field: err.field,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // zod validation errors
  if (err.name === "ZodError") {
    const issues = err.issues.map((i: any) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    res.status(400).json({ error: { message: "validation failed", issues } });
    return;
  }

  // prisma known errors
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    res.status(409).json({
      error: { message: `${field} already exists`, field },
    });
    return;
  }

  if (err.code === "P2025") {
    res.status(404).json({ error: { message: "record not found" } });
    return;
  }

  // fallback
  console.error("unhandled error:", err);
  res.status(500).json({ error: { message: "something went wrong" } });
}
