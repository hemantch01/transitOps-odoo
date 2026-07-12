import { Router } from "express";
import * as handler from "./handler.js";
import { requireAuth, requireRole } from "../../middleware/rbac.js";

const router = Router();

router.get("/fuel", requireAuth, handler.listFuelLogs);
router.post("/fuel", requireAuth, requireRole("dispatcher"), handler.createFuelLog);
router.get("/expenses", requireAuth, handler.listExpenses);
router.post("/expenses", requireAuth, requireRole("dispatcher"), handler.createExpense);

export { router as fuelRoutes };
