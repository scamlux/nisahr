# CareerOS — GPT-only AI + переверстка страниц

**Date:** 2026-07-20
**Branch:** `redesign/gpt-only-declutter`

## Контекст (по аудиту)

Приложение системно выдаёт детерминированные шаблоны за «AI»:
- Роадмап = `pickTemplate()` (7 хардкод-шаблонов), пишет ложный `isAiGenerated: true`.
- Оценка резюме = регэкспы + арифметика (`reviewResume`).
- Интервью = хардкод-вопросы + оценка по длине/regex (`interviewQuestions`, `evaluateAnswer`).
- Progress insights = if/else (`insights`).
- Тексты-обоснования рекомендаций = `REASON_TEMPLATES`.

Реальный LLM зовётся только в свободном чате (`chatWith`/`consult`). БД-персистентность (Prisma, 29 моделей) — настоящая почти везде.

## Решения (утверждены пользователем)

1. **Объём:** полностью — фейковый AI → настоящий GPT + переверстка UI.
2. **AI-провайдер:** только OpenAI (GPT). Убрать mock/gemini/groq/openrouter + мёртвый `openai-llm.provider.ts`.
3. **Воронка:** вернуть psych-test + learning в навигацию (снять MVP_MODE-скрытие).
4. **Биллинг:** вырезать целиком (free-first) — PremiumGate, PLANS, Crown, прайсинг, free-notice.
5. **Старт переверстки:** Roadmap (после AI-фундамента).

## Что ОСТАЁТСЯ детерминированным (не регрессить в GPT!)

Per PRD FR-2 и здравый смысл — воспроизводимость важнее:
- RIASEC-скоринг псих-теста (`scoreAnswers`).
- `matchProfessions(axes)` — маппинг осей → профессии.
- Roadmap CRUD и пересчёт completion, job-readiness агрегация, assessment-скоринг.

GPT пишет только **обоснование/контент**, не воспроизводимые числа.

## Фаза 0 — AI на GPT (архитектура)

**Провайдеры:** удалить mock/gemini/groq/openrouter/openai-llm(dup). Оставить `OpenAiLlmProvider` + базовый `OpenAiCompatibleProvider`. Упростить `AiRegistryService` до openai-only; `/ai/models` возвращает только openai.

**GPT-first с fallback:** каждый конвертируемый метод:
```
try {
  const raw = await chatWith(prompt, { json: true });   // промпт содержит слово "json"
  return Schema.parse(JSON.parse(raw.text));             // JSON.parse+zod внутри try
} catch { return <существующий детерминированный шаблон>; }  // никогда не падаем
```
Шаблоны понижаются до safety-net, не удаляются. Zod-схемы вывода — новый `ai/ai-schemas.ts`.

**Цели конверсии:** `generateRoadmap`, `reviewResume`, `interviewQuestions`, `evaluateAnswer`, `insights`, тексты-обоснования рекомендаций.

**Латентность чата:** side-panel рекомендации в `consult` остаются детерминированными (1 GPT-вызов на реплику). GPT-обоснование ролей — только в standalone psych→career, одним объединённым вызовом.

**Done Фазы 0:** роадмап реально сгенерён через GPT живым ключом end-to-end (не только typecheck).

## Фаза 1+ — переверстка (по образцу Assessment: 1 задача/экран, чёткие состояния)

Roadmap (React Flow, один движок — показать макет на апрув) → Career (табы) → Home → Progress → Psych-test → Profile → Learning → Onboarding → Landing.

Сквозное: один канонический источник рекомендаций, единый score-виджет, реальные empty/loading, мобильная навигация.
