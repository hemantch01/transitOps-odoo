FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY server/package.json server/package-lock.json* ./server/
WORKDIR /app/server
RUN npm ci

FROM base AS build
COPY --from=deps /app/server/node_modules /app/server/node_modules
RUN ln -s /app/server/node_modules /app/node_modules
COPY server/ /app/server/
COPY shared/ /app/shared/
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/server/node_modules /app/server/node_modules
COPY --from=build /app/server/dist /app/server/dist
COPY --from=build /app/server/prisma /app/server/prisma
COPY --from=build /app/server/node_modules/.prisma /app/server/node_modules/.prisma
WORKDIR /app/server
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server/src/index.js"]
