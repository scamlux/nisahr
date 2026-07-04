# ---- Build stage ----
FROM node:20-bookworm-slim AS build
RUN corepack enable && apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Workspace manifests first (better layer caching)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile=false

# Source
COPY packages/shared packages/shared
COPY apps/api apps/api

RUN pnpm --filter @careeros/shared build \
  && pnpm --filter @careeros/api prisma:generate \
  && pnpm --filter @careeros/api build

# ---- Runtime stage ----
FROM node:20-bookworm-slim AS runtime
RUN corepack enable && apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/ ./

EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
