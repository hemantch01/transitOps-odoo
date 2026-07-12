import { Router } from "express";
import * as handler from "./handler.js";
import { requireAuth, requireRole } from "../../middleware/rbac.js";

const router = Router();

router.get("/", requireAuth, handler.list);
router.get("/:id", requireAuth, handler.getById);
router.post("/", requireAuth, requireRole("dispatcher"), handler.create);
router.put("/:id/dispatch", requireAuth, requireRole("dispatcher"), handler.dispatch);
router.put("/:id/complete", requireAuth, requireRole("dispatcher"), handler.complete);
router.put("/:id/cancel", requireAuth, requireRole("dispatcher"), handler.cancel);

export { router as tripRoutes };
