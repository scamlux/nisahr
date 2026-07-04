# CareerOS — Implementation Plan & Technical Backlog

**Version:** 1.0
**Owner:** Founding Engineer
**Date:** 2026-07-03
**Source of truth:** `CareerOS-PRD.pdf`, `CareerOS_App_Architecture.pdf`

Формат: каждая задача = тех. спецификация с описанием, деталями реализации, критериями приёмки (DoD), зависимостями и оценкой. Оценка в story points (1 SP ≈ 0.5–1 инженеро-дня).

---

## 0. Архитектурный ревью и решения (Decisions Log)

Пересмотр того, что заявлено в ТЗ, с инженерными поправками:

| # | Вопрос из ТЗ | Решение | Обоснование |
|---|--------------|---------|-------------|
| D1 | «AI integration (LLM API)» без деталей | Абстракция `LlmProvider` + два адаптера: `OpenAiProvider` и `MockLlmProvider`, выбор через `AI_PROVIDER` | Разработка/CI/демо без ключа и без сжигания бюджета; смена вендора без переписывания логики |
| D2 | Хранение AI-выхода | Структурированный JSON валидируется zod-схемой на выходе LLM; при невалидности — 1 авто-ретрай с "repair"-промптом, затем fallback-шаблон | LLM недетерминирован; нельзя пускать сырой текст в БД |
| D3 | Roadmap полностью из LLM | Гибрид: 7 seed-шаблонов (Frontend/Backend/PM/UIUX/Data/QA/AI) как каркас, LLM только адаптирует под уровень/время | Дешевле, стабильнее, работает при деградации AI |
| D4 | Аналитика/стрики | Единый `ProgressEvent` (event-sourcing-lite) как источник правды; дашборды считаются агрегациями | Нельзя хранить производные метрики как поля — рассинхрон |
| D5 | Роли Student/Instructor/Admin + Free/Premium | Две ортогональные оси: `role` (RBAC) и `plan` (feature-gating). Два независимых guard'а | Роль ≠ тариф; смешивать нельзя |
| D6 | Payment Service | В MVP — mock-биллинг (upgrade/downgrade эндпоинты), Stripe за фиче-флагом позже | Не блокировать MVP интеграцией платежей |
| D7 | Загрузка файлов (CV, видео курсов) | Абстракция `StorageProvider`: local-disk в dev, S3-совместимое в prod | Портируемость, тесты без облака |
| D8 | Монорепо | pnpm workspaces: `apps/api`, `apps/web`, `packages/shared` | Единые типы/DTO между фронтом и бэком, без дублирования |
| D9 | Мобайл vs Web | MVP — web-first (Next.js), архитектура мобайла из второго PDF учтена как будущий клиент к тому же API | ТЗ backend един для обоих; сначала web |

**Нефункциональные требования (NFR):** p95 API < 300ms (без учёта LLM-вызовов), LLM-вызовы — асинхронно со стримингом; покрытие тестами core-логики ≥ 70%; все секреты в env; OpenAPI/Swagger обязателен.

---

## 1. Roadmap по фазам

- **Phase 0 — Foundation** (инфра, БД, auth, shared, AI-абстракция) — блокирует всё.
- **Phase 1 — Core MVP ★** (Roadmap Engine, AI-HR Chat, Progress tracker, мини-LMS) — то, что помечено обязательным в разделе 8 PRD.
- **Phase 2 — Career Prep** (Resume review, Mock interview, Job Readiness).
- **Phase 3 — Monetization & Roles** (plan-gating, subscription, instructor/admin, сертификаты).
- **Phase 4 — Hardening** (тесты, observability, CI/CD, деплой, безопасность).

Критический путь: `EPIC-0 → EPIC-2 (Roadmap) → EPIC-3 (Chat) → EPIC-5 (Progress) → EPIC-9 (Frontend)`.

---

## EPIC-0 — Foundation & Infrastructure  `[Phase 0]`

### T0.1 — Монорепо и тулинг  `3 SP`  *(deps: —)*
Инициализировать pnpm workspaces: `apps/api`, `apps/web`, `packages/shared`. Настроить TypeScript project references, ESLint + Prettier (единый конфиг в корне), Husky + lint-staged, commitlint (conventional commits).
**DoD:** `pnpm i` ставит всё; `pnpm lint` и `pnpm build` зелёные во всех воркспейсах.

### T0.2 — Docker Compose окружение  `3 SP`  *(deps: T0.1)*
`docker-compose.yml`: сервисы `postgres:16`, `api`, `web`, `adminer` (dev). Volume для БД, healthchecks, `.env.example` на каждый сервис. `Makefile`: `make up`, `make down`, `make seed`, `make dev`, `make logs`.
**DoD:** `make up` поднимает стек; API и web отвечают на healthcheck; Postgres переживает рестарт.

### T0.3 — NestJS каркас + конфиг  `2 SP`  *(deps: T0.1)*
Bootstrap NestJS: `ConfigModule` (валидация env через zod/joi), глобальный `ValidationPipe`, `HttpExceptionFilter`, `LoggingInterceptor` (request-id), CORS, health-эндпоинт `/health`. Swagger на `/api/docs`.
**DoD:** сервер стартует, `/health` = 200, Swagger рендерится, невалидный env падает на старте с понятной ошибкой.

### T0.4 — Prisma + схема БД (полная модель)  `5 SP`  *(deps: T0.2)*
Реализовать Prisma-схему из раздела 3 (все сущности: User, CareerProfile, ChatSession/Message, CareerRecommendation, Roadmap/Stage/Skill/StageSkill, LearningResource, PracticalTask, Course/Lesson/Quiz/QuizQuestion/Enrollment/Certificate, ProgressEvent, ResumeReview, MockInterview, JobReadiness, Subscription). Индексы на FK и на `ProgressEvent(userId, createdAt)`. Первая миграция.
**DoD:** `prisma migrate dev` проходит; `prisma studio` показывает все таблицы; связи и каскады корректны.

### T0.5 — `packages/shared` (типы + zod DTO + enums)  `3 SP`  *(deps: T0.1)*
Единые enum'ы (Role, Plan, SkillStatus, ResourceType, InterviewType, ProgressEventType), zod-схемы всех DTO (request/response), выведенные TS-типы. Экспорт для api и web.
**DoD:** и `api`, и `web` импортируют схемы; изменение схемы ломает типы на обеих сторонах (single source of truth).

### T0.6 — StorageProvider абстракция  `2 SP`  *(deps: T0.3)*
Интерфейс `StorageProvider` (`put/get/getSignedUrl/delete`), реализации `LocalDiskStorage` (dev) и `S3Storage` (prod, за env). Валидация MIME/размера при загрузке.
**DoD:** файл загружается и скачивается локально; переключение на S3 только через env.

---

## EPIC-1 — Auth, RBAC & Plan Gating  `[Phase 0]`

### T1.1 — Регистрация/логин + JWT  `3 SP`  *(deps: T0.4, T0.5)*
`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`. Argon2/bcrypt для паролей, access-token (15м) + refresh-token (7д, httpOnly cookie либо ротация в БД). `GET /auth/me`.
**DoD:** полный флоу работает; пароли не хранятся в открытом виде; протухший access обновляется через refresh; e2e-тест логина зелёный.

### T1.2 — RBAC guard  `2 SP`  *(deps: T1.1)*
Декоратор `@Roles(Role.ADMIN, ...)` + `RolesGuard`. `STUDENT | INSTRUCTOR | ADMIN`. Глобально запрет по умолчанию, явный allow.
**DoD:** студент получает 403 на instructor/admin-эндпоинтах; юнит-тесты на guard.

### T1.3 — PlanGuard (feature-gating)  `2 SP`  *(deps: T1.1)*
Декоратор `@RequiresPlan(Plan.PREMIUM)` + `PlanGuard`. Free-лимиты: 1 roadmap, базовый chat, базовый tracker. Premium: безлимит roadmap, mock-interview, deep skill analysis, insights, сертификаты.
**DoD:** free-юзер получает 402/403 с машиночитаемым кодом `PLAN_UPGRADE_REQUIRED` при попытке premium-действия; юнит-тесты на каждый лимит.

### T1.4 — Seed-скрипт (базовые данные)  `3 SP`  *(deps: T1.1, T0.4)*
Идемпотентный seed: 1 admin, 1 instructor, 2 студента (free + premium), 7 стандартных roadmap-шаблонов, 2–3 внутренних курса с уроками и квизами, каталог learning-ресурсов, демо ProgressEvent'ы (чтобы дашборды не были пустыми).
**DoD:** `make seed` наполняет БД; повторный запуск не дублирует; известные логины задокументированы в README.

---

## EPIC-2 — Roadmap Engine ★ (core differentiator)  `[Phase 1]`

### T2.1 — LLM-абстракция `AiModule`  `5 SP`  *(deps: T0.3, T0.5)*
Интерфейс `LlmProvider.complete(messages, {json?, schema?})`. `OpenAiProvider` (стриминг, таймауты, ретраи с backoff, учёт токенов) и `MockLlmProvider` (детерминированные ответы под каждую задачу). Выбор через `AI_PROVIDER`. Слой `structured-output`: валидация ответа zod-схемой, repair-ретрай, fallback.
**DoD:** приложение полностью работает при `AI_PROVIDER=mock` без ключа; при `openai` — реальные ответы; невалидный JSON от LLM не роняет запрос.

### T2.2 — Seed стандартных roadmap  `3 SP`  *(deps: T0.4)*
7 профессий как структурированные шаблоны (stages → skills → linked resources → practical tasks → milestones → estimatedWeeks). Хранятся как данные, доступны как fallback и как основа для персонализации.
**DoD:** `GET /roadmaps/templates` отдаёт 7 валидных шаблонов; каждый проходит zod-валидацию структуры.

### T2.3 — Генерация персонального roadmap  `5 SP`  *(deps: T2.1, T2.2)*
`POST /roadmaps/generate` (targetRole, level, weeklyHours). Промпт берёт ближайший шаблон и адаптирует под пользователя. Результат сохраняется как Roadmap + Stages + Skills + Tasks. `estimatedWeeks` пересчитывается от weeklyHours.
**DoD:** для junior + Backend + 10ч/нед возвращается связный roadmap; free-юзер ограничен 1 roadmap (PlanGuard); структура валидна.

### T2.4 — CRUD и прогресс roadmap  `3 SP`  *(deps: T2.3)*
`GET/PATCH/DELETE /roadmaps/:id`, отметка stage/skill/task как done, добавление кастомной задачи. Completion % пересчитывается на каждое изменение и эмитит `ProgressEvent`.
**DoD:** отметка навыка меняет %; удаление roadmap каскадит; unit-тест на формулу completion %.

### T2.5 — Skill-gap анализ  `3 SP`  *(deps: T2.3)*
`GET /roadmaps/:id/skill-gaps`: сравнение `CareerProfile.currentSkills` с навыками roadmap → список gap'ов с приоритетом. Premium-версия добавляет AI-объяснение и порядок изучения.
**DoD:** возвращает корректный diff; premium-ответ обогащён AI; free получает базовый список.

---

## EPIC-3 — AI-HR Consult Chat ★  `[Phase 1]`

### T3.1 — Онбординг-квиз и CareerProfile  `3 SP`  *(deps: T1.1)*
`POST /career/profile` (интересы, цели, опыт, навыки, стиль работы, сильные/слабые стороны), `GET /career/profile`, флаг `onboardingCompleted`.
**DoD:** профиль сохраняется/читается; повторная отправка обновляет; валидация DTO.

### T3.2 — Чат-сессии и сообщения  `5 SP`  *(deps: T2.1, T3.1)*
`POST /chat/sessions`, `GET /chat/sessions`, `POST /chat/sessions/:id/messages` со стримингом (SSE). Career-consultant-промпт возвращает текст + структурный JSON-блок (рекомендации/skill-gaps) → в `structuredPayload`. История сообщений в контексте.
**DoD:** диалог ведётся с памятью сессии; структурный вывод парсится и сохраняется; стриминг работает end-to-end.

### T3.3 — Career recommendations  `3 SP`  *(deps: T3.1, T2.1)*
`POST /career/recommendations`: AI ранжирует профессии (title, reason, entryDifficulty, estimatedMonths, score) из профиля. Сохранение в `CareerRecommendation`.
**DoD:** для заполненного профиля — 3–5 ранжированных рекомендаций с обоснованием; валидная структура.

---

## EPIC-4 — Learning Hub & Internal LMS ★  `[Phase 1]`

### T4.1 — Каталог learning-ресурсов  `3 SP`  *(deps: T0.4)*
`GET /learning/resources?skillId=&type=`. Курируемые ресурсы (VIDEO/ARTICLE/YOUTUBE/COURSERA/UDEMY/INTERNAL), привязка к навыку/стадии, сохранение в избранное `POST /learning/saved`.
**DoD:** фильтрация по навыку и типу работает; избранное сохраняется на пользователя.

### T4.2 — Внутренние курсы (Instructor)  `5 SP`  *(deps: T1.2, T0.6)*
CRUD курса (INSTRUCTOR/ADMIN), уроки с видео (через StorageProvider), публикация/снятие. `GET /courses`, `GET /courses/:id`.
**DoD:** инструктор создаёт курс с уроками и публикует; студент видит только опубликованные; RBAC enforced.

### T4.3 — Enrollment, уроки, прогресс  `3 SP`  *(deps: T4.2)*
`POST /courses/:id/enroll`, отметка урока пройденным → эмитит `ProgressEvent(LESSON_DONE)` + пересчёт `Enrollment.progressPct`.
**DoD:** запись на курс, прохождение урока двигает %; события пишутся в трекер.

### T4.4 — Квизы с автопроверкой  `3 SP`  *(deps: T4.3)*
`GET /courses/:id/quiz`, `POST /quiz/:id/submit` → авто-оценка по correctIndex, сохранение результата, разблокировка сертификата при завершении курса.
**DoD:** сабмит квиза возвращает счёт и разбор; прохождение курса выдаёт `Certificate` (premium-gated).

---

## EPIC-5 — Progress & Analytics ★  `[Phase 1]`

### T5.1 — ProgressEvent сервис  `2 SP`  *(deps: T0.4)*
Централизованный `ProgressService.record(event)` — единая точка записи из roadmap/LMS. Типы: LESSON_DONE, SKILL_DONE, TASK_DONE, STAGE_DONE, с hoursSpent.
**DoD:** все модули пишут прогресс только через сервис; юнит-тест на запись.

### T5.2 — Дашборд-агрегации  `5 SP`  *(deps: T5.1)*
`GET /progress/dashboard`: roadmap completion %, learning streak (последовательные активные дни), недельные/месячные часы, skill heatmap, счётчики навыков/курсов. Всё считается из ProgressEvent.
**DoD:** метрики совпадают с seed-данными; unit-тесты на streak (включая разрывы/таймзоны) и на недельную агрегацию.

### T5.3 — AI learning insights  `3 SP`  *(deps: T5.2, T2.1)*  *(Premium)*
`GET /progress/insights`: AI-анализ продуктивности, скорости, зон роста, риска потери мотивации + weekly summary из агрегатов.
**DoD:** возвращает осмысленные инсайты на основе реальных агрегатов; gated под Premium.

---

## EPIC-6 — Career Preparation  `[Phase 2]`

### T6.1 — Resume review  `5 SP`  *(deps: T0.6, T2.1)*
`POST /resume/review` (upload pdf/docx) → извлечение текста → AI: score, strengths[], gaps[], suggestions[]. Сохранение `ResumeReview`, история `GET /resume/reviews`.
**DoD:** pdf и docx парсятся; ответ структурирован и сохранён; большие/битые файлы отклоняются корректно.

### T6.2 — Mock interview  `5 SP`  *(deps: T2.1)*  *(Premium)*
`POST /interview/mock` (type: HR/TECHNICAL/BEHAVIORAL) — пошаговый диалог: AI задаёт вопросы, оценивает ответы, в конце feedback + score. Транскрипт в `MockInterview`.
**DoD:** проходится полный цикл интервью с оценкой; gated под Premium; транскрипт сохраняется.

### T6.3 — Job Readiness score  `3 SP`  *(deps: T2.4, T6.1, T6.2)*
`GET /career/job-readiness?role=`: 0–100 из взвешенных компонент (skills coverage, roadmap %, resume score, interview score) + breakdown.
**DoD:** детерминированная формула, покрыта unit-тестами; breakdown прозрачен; пересчёт при изменении компонент.

---

## EPIC-7 — Monetization & Subscription  `[Phase 3]`

### T7.1 — Mock-биллинг и подписка  `3 SP`  *(deps: T1.3)*
`POST /subscription/upgrade`, `POST /subscription/downgrade`, `GET /subscription`. Меняет `User.plan`, пишет `Subscription`. Stripe за фиче-флагом (заглушка интерфейса `PaymentProvider`).
**DoD:** апгрейд открывает premium-фичи немедленно; даунгрейд закрывает; история подписки корректна.

### T7.2 — Instructor/Admin панель (API)  `3 SP`  *(deps: T1.2, T4.2)*
Admin: управление пользователями/ролями, модерация курсов. Instructor: аналитика по своим курсам (enrollments, completion). Revenue-share расчёт (данные, без реальных выплат).
**DoD:** RBAC строго разграничивает; admin видит всё, instructor — только своё.

---

## EPIC-8 — Frontend (Next.js)  `[Phase 1–3, параллельно API]`

> Верстку вести под премиум-редизайн (см. `Premium-Redesign-Prompt.md`) — но сначала функциональный слой.

### T8.1 — App shell, auth, роутинг, API-клиент  `5 SP`  *(deps: T1.1, T0.5)*
App Router, layout с навигацией (Home/Roadmap/Learning/Progress/Career/Profile), TanStack Query + типизированный API-клиент из `shared`, Zustand для сессии, protected routes, обработка 401/refresh.
**DoD:** логин→редирект в приложение; защищённые роуты недоступны без токена; типы DTO шарятся с бэком.

### T8.2 — Онбординг-квиз + Home (AI-чат)  `5 SP`  *(deps: T8.1, T3.2)*
Многошаговый квиз, стриминговый чат-UI, карточки рекомендаций из `structuredPayload`, suggested-prompts.
**DoD:** новый юзер проходит онбординг и получает рекомендации; чат стримит ответы.

### T8.3 — Roadmap UI  `5 SP`  *(deps: T8.1, T2.4)*
Интерактивные стадии/навыки/задачи, прогресс-бары, отметка done с optimistic update, кнопка генерации, skill-gap вью.
**DoD:** генерация и редактирование roadmap из UI; % обновляется мгновенно.

### T8.4 — Learning UI (каталог + плеер + квиз)  `5 SP`  *(deps: T8.1, T4.4)*
Каталог курсов, видео-плеер уроков, прохождение квизов с фидбеком, избранные ресурсы.
**DoD:** запись на курс, просмотр урока, сдача квиза — полный флоу из UI.

### T8.5 — Progress-дашборд  `3 SP`  *(deps: T8.1, T5.2)*
Recharts-графики, streak-виджет, heatmap навыков, KPI-счётчики, insights (premium).
**DoD:** дашборд отображает реальные данные; premium-инсайты за гейтом.

### T8.6 — Career UI (resume, interview, readiness)  `5 SP`  *(deps: T8.1, T6.3)*
Dropzone загрузки CV + отчёт, mock-interview чат, job-readiness gauge, Profile + Pricing/подписка.
**DoD:** загрузка резюме показывает разбор; интервью проходится; апгрейд плана из UI.

---

## EPIC-9 — Hardening, QA & Delivery  `[Phase 4]`

### T9.1 — Тесты (unit + e2e)  `5 SP`  *(deps: core epics)*
Unit: completion %, streak, plan-gating, job-readiness, structured-output repair. E2e (MockLlm): auth → онбординг → генерация roadmap → прогресс → job-readiness. Порог покрытия core ≥ 70%.
**DoD:** CI гоняет тесты; порог покрытия enforced; e2e-smoke зелёный.

### T9.2 — Observability  `3 SP`  *(deps: T0.3)*
Структурные логи (pino) с request-id, Sentry для ошибок, метрики LLM (латентность, токены, доля fallback), rate-limiting на AI-эндпоинтах.
**DoD:** ошибки видны в Sentry; AI-метрики логируются; rate-limit срабатывает.

### T9.3 — Security pass  `3 SP`  *(deps: T1.x)*
Helmet, CORS-allowlist, валидация загрузок, защита от IDOR (проверка владения ресурсом), секреты только в env, зависимость-аудит (`pnpm audit`).
**DoD:** чужой пользователь не читает чужие roadmap/resume (тест на IDOR); аудит без критических уязвимостей.

### T9.4 — CI/CD  `3 SP`  *(deps: T9.1)*
GitHub Actions: lint → typecheck → test → build → docker image. Preview-деплой (Vercel для web, контейнер для api). Prisma-миграции в пайплайне.
**DoD:** PR запускает пайплайн; merge в main собирает образы; миграции применяются автоматически.

---

## 2. Оценка и последовательность

| Phase | Epics | Σ SP | Комментарий |
|-------|-------|------|-------------|
| 0 Foundation | EPIC-0, EPIC-1 | ~35 | Блокирует всё, делать первым |
| 1 Core MVP ★ | EPIC-2,3,4,5 + T8.1–8.5 | ~72 | Демо-able продукт по разделу 8 PRD |
| 2 Career Prep | EPIC-6 + T8.6 | ~23 | |
| 3 Monetization | EPIC-7 | ~6 | |
| 4 Hardening | EPIC-9 | ~14 | Параллельно с 1–3 |

**Минимальный демо-срез (Walking Skeleton):** T0.1–T0.5 → T1.1 → T2.1 → T2.2 → T2.3 → T8.1 → T8.3. После него уже можно показать генерацию персонального roadmap инвестору.

## 3. Definition of Done (глобальный)
Задача закрыта, когда: код + тесты в main через PR-ревью; DTO типизированы через `shared`; Swagger обновлён; работает при `AI_PROVIDER=mock`; нет регрессий в e2e-smoke; секреты не в коде.

## 4. Ключевые риски (из PRD §11) и меры
- **Over-engineering AI** → строгие структурные схемы + fallback-шаблоны (D2, D3), не полагаться на "магию" LLM.
- **Сложный UX** → сначала функциональный слой, редизайн отдельной фазой; онбординг ≤ 6 шагов.
- **Низкая платёжеспособность рынка** → mock-биллинг, реальный Stripe только при валидации спроса.
- **Конкуренция с глобальными** → фокус на локальный контент/roadmap как дифференциатор (D3).
