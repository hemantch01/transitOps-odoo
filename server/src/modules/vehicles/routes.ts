import { Router } from "express";
import * as handler from "./handler.js";
import { requireAuth, requireRole } from "../../middleware/rbac.js";

const router = Router();

router.get("/", requireAuth, handler.list);
router.get("/:id", requireAuth, handler.getById);
router.post("/", requireAuth, requireRole("manager"), handler.create);
router.put("/:id", requireAuth, requireRole("manager"), handler.update);
router.delete("/:id", requireAuth, requireRole("admin"), handler.remove);

export { router as vehicleRoutes };
