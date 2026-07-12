
// @ts-nocheck
import { betterAuth } from "better-auth";

import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import { env } from "./env.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
 
  plugins: [
    admin({
      defaultRole: "viewer",
    }),
  ],
 
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min
    },
    expiresIn: 24 * 60 * 60, // 24h
  },
  trustedOrigins: [env.CLIENT_URL, "http://localhost"],
});
