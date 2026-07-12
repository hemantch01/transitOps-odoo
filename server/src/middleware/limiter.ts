import rateLimit from "express-rate-limit";

export const authLimiter= rateLimit(
  {
  windowMs: 20*60*1000, // 20 min window
  max: 100,
  message: { error: { message: "too many requests, try again later" } },
  standardHeaders: true,
  legacyHeaders: false,
}   );

export const apiLimiter=   rateLimit(
  {
  windowMs: 1*60*1000, // 1 min
  max: 200, // max 200 in one min
  message: { error: { message: "too many requests" } },
  standardHeaders: true,
  legacyHeaders: false,
}
     );
