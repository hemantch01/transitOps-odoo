FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY client/package.json client/package-lock.json* ./client/
WORKDIR /app/client
RUN npm ci

FROM base AS build
COPY --from=deps /app/client/node_modules /app/client/node_modules
RUN ln -s /app/client/node_modules /app/node_modules
COPY client/ /app/client/
COPY shared/ /app/shared/
WORKDIR /app/client
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
