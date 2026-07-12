import   express from "express";
import cors    from "cors";
import helmet from "helmet";
import { toNodeHandler } from   "better-auth/node";
import { auth } from "./lib/auth.js";
import { env }   from "./lib/env.js";
import { errorHandler } from "./middleware/errors.js";
import { authLimiter, apiLimiter } from "./middleware/limiter.js";
import { vehicleRoutes } from "./modules/vehicles/routes.js";
import { driverRoutes } from "./modules/drivers/routes.js";
import { tripRoutes } from "./modules/trips/routes.js";
import { maintenanceRoutes } from "./modules/maintenance/routes.js";
import { fuelRoutes } from "./modules/fuel/routes.js";
import { analyticsRoutes } from "./modules/analytics/routes.js";

const app = express();
console.log("starting app..."); // console log added
// security headers
app.use(helmet(
  {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
       scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", env.CLIENT_URL],
    },
  },
}
));

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url} - Origin: ${req.headers.origin} - Host: ${req.headers.host}`);
  next();
});

// cors
app.use(cors(
  {
  origin: [
    env.CLIENT_URL, 
    "http://localhost", 
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000", 
    "http://127.0.0.1:3000"
  ],
  credentials: true,
}
));

// better-auth handles its own body parsing — mount before express.json()
app.all("/api/auth/*splat", authLimiter, toNodeHandler(auth));

console.log("auth mounted");

// parse json for all other routes
app.use(  express.json()  );
app.use(apiLimiter);

// api routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api", fuelRoutes);
app.use("/api/analytics", analyticsRoutes);

// health check
app.get(  "/api/health", (_req, res) => {
  console.log("health check hit!")
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}  );

// global error handler
app.use(errorHandler);

app.listen(env.PORT, () => {
   console.log(`server running on port ${env.PORT}`);
   console.log("server is up and running successfully!")
});

export default app;
