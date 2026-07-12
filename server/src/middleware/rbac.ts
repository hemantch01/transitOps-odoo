import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

// attach session to request
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers),
    });
    if (!session) { res.status(401).json({ error: { message: "not authenticated" } });
      return;
    }

    (req as any).session = session.session;
    (req as any).user = session.user;
    next();
  } catch {
    res.status(401).json({ error: { message: "not authenticated" } });
  }
}

// role hierarchy: admin > manager > dispatcher > viewer
const ROLE_LEVELS: Record<string, number> = {
  admin: 4,
  manager: 3,
  dispatcher: 2,
  viewer: 1,
};

export function requireRole(minRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: { message: "not authenticated" } });
      return;
    }

    const userLevel = ROLE_LEVELS[user.role] || 0;
    const requiredLevel = ROLE_LEVELS[minRole] || 0;

    if (userLevel < requiredLevel) {
      res.status(403).json({ error: { message: "insufficient permissions" } });
      return;
    }

    next();
  };
}
