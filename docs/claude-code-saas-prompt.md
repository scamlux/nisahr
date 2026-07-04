# Промпт для Claude Code CLI — поднять full-stack SaaS с нуля

> Как пользоваться: создай пустую папку, запусти в ней `claude`, и вставь весь блок ниже.
> Перед вставкой замени строку `<< ОПИСАНИЕ ТВОЕГО ПРОДУКТА >>` на 1–2 предложения о том, что делает твой SaaS.
> Если идеи пока нет — оставь как есть, проект соберётся на примере «менеджер задач/проектов».

---

```
Подними с нуля production-ready full-stack SaaS-проект. Работай пошагово, кратко объясняй ключевые решения, и после каждого крупного этапа проверяй что всё запускается без ошибок.

## О продукте
<< ОПИСАНИЕ ТВОЕГО ПРОДУКТА >>
(Если описание не дано — собери SaaS для управления задачами и проектами: пользователь создаёт проекты, внутри проектов — задачи со статусами todo/in_progress/done, дедлайнами и приоритетом.)

## Архитектура
Монорепо на pnpm workspaces с раздельным деплоем (фронт и API независимы):
- apps/web        — React-фронтенд → деплой на Vercel
- apps/api        — Node-бэкенд → деплой на Render
- packages/shared — общие TypeScript-типы и Zod-схемы (импортируются и фронтом, и бэком)

## Стек

Фронтенд (apps/web):
- React 18 + Vite + TypeScript (strict mode)
- Tailwind CSS + shadcn/ui (настрой базовую тему)
- TanStack Query — все запросы к API через неё
- React Router v6 — публичные и защищённые роуты
- React Hook Form + Zod (схемы из packages/shared)
- Тонкий API-клиент (fetch-обёртка) с базовым URL из VITE_API_URL, автоматической подстановкой JWT в заголовки и обработкой 401 → refresh

Бэкенд (apps/api):
- Node + TypeScript (strict) + Fastify
- Prisma ORM + PostgreSQL
- Аутентификация: JWT (короткий access + долгий refresh), пароли через argon2
- CORS — только домен фронта (из переменной окружения)
- Валидация всех входных данных через Zod (схемы из packages/shared)
- Архитектура слоями: routes → controllers → services → prisma
- Централизованный обработчик ошибок и логирование (pino)

## Модели данных (Prisma)
- User: id, email (unique), passwordHash, name, createdAt
- (для примера-домена) Project: id, name, ownerId → User, createdAt
- (для примера-домена) Task: id, title, description, status (enum), priority (enum), dueDate, projectId → Project, createdAt
Замени Project/Task на реальные сущности, если задано описание продукта.

## Стартовый функционал (MVP)
Бэкенд:
- POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
- GET  /auth/me (защищённый) — текущий пользователь
- CRUD-эндпоинты для основных сущностей продукта (защищённые, с проверкой что ресурс принадлежит пользователю)
- GET /health — health-check (нужен Render)
- Middleware проверки JWT для защищённых роутов

Фронтенд:
- Страницы: Landing (публичная), Register, Login, Dashboard (защищённая), и CRUD-экран основной сущности
- Контекст авторизации: хранение токенов, автологин по refresh, logout
- ProtectedRoute-компонент, редирект неавторизованных на /login
- Загрузка/ошибки/пустые состояния через TanStack Query
- Аккуратный UI на shadcn/ui (сайдбар + контент)

## Инфраструктура и конфиги
- TypeScript strict во всех пакетах; единый ESLint + Prettier на корень
- .env.example для apps/web и apps/api с комментариями к каждой переменной
- Корневой package.json со скриптами:
    - dev   — параллельный запуск web и api (через concurrently или turbo)
    - build — сборка обоих
    - lint  — линт всего монорепо
    - db:migrate, db:studio — проксируют в Prisma
- docker-compose.yml — локальный PostgreSQL для разработки
- vercel.json — настройки сборки для apps/web (root directory, build command, output)
- render.yaml (Render Blueprint) — web service для apps/api + managed PostgreSQL, с переменными окружения и командой миграции на деплое
- .gitignore (node_modules, .env, dist, и т.д.)
- README.md: что это, как поднять локально (шаг за шагом), как прогнать миграции, как задеплоить web на Vercel и api+БД на Render, список переменных окружения

## Порядок работы (выполняй по этапам, коммить после каждого)
1. Покажи план файловой структуры монорепо и дождись моего «ок».
2. Создай структуру, корневые конфиги (pnpm-workspace.yaml, tsconfig, eslint, prettier), .gitignore. git init + первый коммит.
3. packages/shared — типы и Zod-схемы.
4. apps/api — Fastify, Prisma-схема + первая миграция, auth (register/login/refresh/me), CRUD основной сущности, /health, обработка ошибок. Коммит.
5. apps/web — Vite, Tailwind, shadcn/ui, роутинг, контекст авторизации, API-клиент, страницы и CRUD-экран. Коммит.
6. docker-compose.yml, vercel.json, render.yaml, README.md, .env.example. Коммит.
7. Финальная проверка: `pnpm install` и `pnpm dev` должны поднять оба приложения; покажи команды для миграций и краткий чек-лист «что проверить руками».

## Правила
- Где есть выбор между подходами — бери самый простой и стандартный, не усложняй и не тащи лишних зависимостей.
- Не клади секреты в код — только через .env.
- Пиши осмысленные сообщения коммитов.
- Если упираешься в неоднозначность — спроси, а не угадывай молча.
```

---

## Шпаргалка после генерации

Локальный запуск:
```bash
pnpm install
docker compose up -d        # поднять PostgreSQL
pnpm db:migrate             # применить миграции Prisma
pnpm dev                    # web + api параллельно
```

Деплой:
- **apps/web → Vercel:** New Project → root directory `apps/web`, framework Vite, переменная `VITE_API_URL` = адрес Render-сервиса.
- **apps/api → Render:** New → Blueprint, указать репозиторий с `render.yaml`; Render сам создаст web service + PostgreSQL и прокинет `DATABASE_URL`. Добавь `JWT_SECRET`, `CORS_ORIGIN` (домен Vercel).
