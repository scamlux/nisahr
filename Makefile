.PHONY: help install up down logs seed migrate dev dev-api dev-web build test clean

help:
	@echo "CareerOS — make targets"
	@echo "  make install   Install all workspace dependencies (pnpm)"
	@echo "  make up        docker-compose up (postgres + api + web), builds images"
	@echo "  make down      Stop and remove containers"
	@echo "  make logs      Tail container logs"
	@echo "  make migrate   Run Prisma migrations inside the api container"
	@echo "  make seed      Seed the database inside the api container"
	@echo "  make dev       Run api + web locally with pnpm (needs local Postgres)"
	@echo "  make dev-api   Run only the API in watch mode"
	@echo "  make dev-web   Run only the web app"
	@echo "  make build     Build shared, api and web"
	@echo "  make test      Run all tests"

install:
	pnpm install

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=100

migrate:
	docker compose exec api pnpm --filter @careeros/api prisma:migrate

seed:
	docker compose exec api pnpm --filter @careeros/api prisma:seed

build:
	pnpm --filter @careeros/shared build
	pnpm --filter @careeros/api build
	pnpm --filter @careeros/web build

dev:
	pnpm --filter @careeros/shared build
	pnpm -r --parallel --filter @careeros/api --filter @careeros/web dev

dev-api:
	pnpm --filter @careeros/shared build && pnpm --filter @careeros/api dev

dev-web:
	pnpm --filter @careeros/web dev

test:
	pnpm --filter @careeros/api test

clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules apps/*/dist apps/web/.next packages/*/dist
