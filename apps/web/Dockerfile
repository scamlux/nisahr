# ---- Build stage ----
FROM node:20-bookworm-slim AS build
RUN corepack enable
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile=false

COPY packages/shared packages/shared
COPY apps/web apps/web

RUN pnpm --filter @careeros/shared build \
  && pnpm --filter @careeros/web build

# ---- Runtime stage ----
FROM node:20-bookworm-slim AS runtime
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/ ./

EXPOSE 3000
CMD ["pnpm", "--filter", "@careeros/web", "start"]
