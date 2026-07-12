import { Router } from "express";
import * as handler from "./handler.js";
import { requireAuth } from "../../middleware/rbac.js";

const router = Router();

router.get("/dashboard", requireAuth, handler.dashboard);
router.get("/reports", requireAuth, handler.reports);
router.get("/export/csv", requireAuth, handler.exportCSV);

export { router as analyticsRoutes };
