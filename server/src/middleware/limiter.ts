import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: { message: "too many requests, try again later" } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 200,
  message: { error: { message: "too many requests" } },
  standardHeaders: true,
  legacyHeaders: false,
});
