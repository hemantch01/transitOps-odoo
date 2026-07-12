import { Router } from "express";
import * as handler from "./handler.js";
import { requireAuth, requireRole } from "../../middleware/rbac.js";

const router = Router();

router.get("/", requireAuth, handler.list);
router.post("/", requireAuth, requireRole("manager"), handler.create);
router.put("/:id/close", requireAuth, requireRole("manager"), handler.close);

export { router as maintenanceRoutes };
