/**
 * Translation dictionaries for CareerOS. Three locales: English, Russian, Uzbek.
 * Keys are shared 1:1 across locales — `en` is the canonical shape.
 * Landing copy is conversion-focused and written to read natively per language.
 */

import { pagesEn, pagesRu, pagesUz } from './i18n-pages';

export const LOCALES = ['ru', 'uz', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { label: string; native: string; flag: string }> = {
  ru: { label: 'Russian', native: 'Русский', flag: '🇷🇺' },
  uz: { label: 'Uzbek', native: "O'zbekcha", flag: '🇺🇿' },
  en: { label: 'English', native: 'English', flag: '🇬🇧' },
};

const en = {
  nav: {
    howItWorks: 'How it works',
    features: 'Features',
    pricing: 'Pricing',
    signIn: 'Sign in',
    getStarted: 'Get started',
  },
  hero: {
    badge: 'From lost to hired — with AI',
    titleQuestion: '“what do I become?”',
    titleAnswer: '“I got the job.”',
    from: 'From',
    to: 'to',
    subtitle:
      'Skip the guesswork. CareerOS gives you an AI-HR coach, a step-by-step roadmap and real interview prep — so you stop drifting and start landing offers.',
    ctaPrimary: 'Get my plan — free',
    ctaSecondary: 'I already have an account',
  },
  stats: {
    tracks: 'Career tracks',
    milestones: 'Curated milestones',
    readiness: 'Job-readiness score',
    modules: 'Modules, one OS',
  },
  how: {
    title: 'How CareerOS works',
    subtitle: 'Three steps. One outcome: hired.',
    step1Title: 'Find your direction',
    step1Body:
      'A two-minute chat with an AI-HR that reads your strengths and goals — then hands you roles you’ll actually want, with the exact skill gaps to close.',
    step2Title: 'Get your roadmap',
    step2Body:
      'A clear week-by-week plan — skills, curated resources and real projects — built around your level and your schedule. No more random tutorials.',
    step3Title: 'Get hired',
    step3Body:
      'Learn, ship projects, watch your readiness score climb, and rehearse interviews with AI until walking into the room feels easy.',
  },
  features: {
    title: 'One platform.',
    titleAccent: 'Every step.',
    subtitle: 'No more ten tabs, abandoned courses and guesswork — just one clear system that takes you all the way to hired.',
    items: [
      { title: 'AI-HR Consultant', body: 'Honest, personal guidance and a real skill-gap read — the kind of coaching you’d pay for, on demand.' },
      { title: 'Roadmap Engine', body: 'Your exact path to the role, week by week — editable, milestone-tracked and visual in 3D.' },
      { title: 'Learning Hub', body: 'Curated resources and a built-in LMS — lessons, quizzes and certificates that actually get you hired.' },
      { title: 'Progress Analytics', body: 'See your momentum — streaks, hours and skill heatmaps — with AI spotting what to fix before you stall.' },
      { title: 'Interview Prep', body: 'Rehearse real HR, technical and behavioral interviews with instant scored feedback, until the nerves are gone.' },
      { title: 'Job Readiness', body: 'One 0–100 score that tells you honestly when you’re ready to apply — and what to fix if you’re not.' },
    ],
  },
  pricing: {
    title: 'Simple pricing',
    subtitle: 'Start free today. Upgrade only when you’re ready to go all-in on the offer.',
    perMonth: '/mo',
    mostPopular: 'Most popular',
    free: {
      name: 'Free',
      tagline: 'Find your direction',
      features: ['AI-HR chat (basic)', '1 personalized roadmap', 'Learning hub access', 'Basic progress tracker'],
      cta: 'Start free',
    },
    premium: {
      name: 'Premium',
      tagline: 'Everything it takes to land the job',
      features: ['Unlimited roadmaps', 'Mock interviews', 'Deep skill-gap analysis', 'AI learning insights', 'Resume review & job readiness', 'Verified certificates'],
      cta: 'Go Premium',
    },
  },
  ctaBand: {
    title: 'Stop guessing. Start getting hired.',
    subtitle: 'Get your personalized plan in two minutes — free. Your next offer is closer than you think.',
    button: 'Start free — no card needed',
  },
  footer: {
    tagline: 'From first step to first offer.',
    rights: 'All rights reserved.',
  },
  ui: {
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    language: 'Language',
  },
  pages: pagesEn,
};

type Dict = typeof en;

const ru: Dict = {
  nav: {
    howItWorks: 'Как это работает',
    features: 'Возможности',
    pricing: 'Тарифы',
    signIn: 'Войти',
    getStarted: 'Начать',
  },
  hero: {
    badge: 'От растерянности до оффера — с ИИ',
    titleQuestion: '«кем мне стать?»',
    titleAnswer: '«меня взяли на работу.»',
    from: 'От',
    to: 'к',
    subtitle:
      'Хватит гадать. CareerOS даёт тебе ИИ-HR-коуча, пошаговый план и настоящую подготовку к собеседованиям — чтобы ты перестал плыть по течению и начал получать офферы.',
    ctaPrimary: 'Получить мой план — бесплатно',
    ctaSecondary: 'У меня уже есть аккаунт',
  },
  stats: {
    tracks: 'Карьерных направлений',
    milestones: 'Отобранных этапов',
    readiness: 'Балл готовности к найму',
    modules: 'Модулей, одна ОС',
  },
  how: {
    title: 'Как работает CareerOS',
    subtitle: 'Три шага. Один результат — оффер.',
    step1Title: 'Найди своё направление',
    step1Body:
      'Двухминутный разговор с ИИ-HR, который считывает твои сильные стороны и цели — и выдаёт роли, которые тебе реально зайдут, вместе с пробелами, которые нужно закрыть.',
    step2Title: 'Получи свой роадмап',
    step2Body:
      'Понятный план по неделям — навыки, отобранные материалы и реальные проекты — под твой уровень и график. Никаких случайных туториалов.',
    step3Title: 'Получи оффер',
    step3Body:
      'Учись, делай проекты, следи, как растёт балл готовности, и тренируй собеседования с ИИ — пока заходить в переговорку не станет легко.',
  },
  features: {
    title: 'Одна платформа.',
    titleAccent: 'Каждый шаг.',
    subtitle: 'Больше никаких десяти вкладок, брошенных курсов и догадок — одна понятная система, которая доводит тебя до оффера.',
    items: [
      { title: 'ИИ-HR-консультант', body: 'Честный персональный разбор и реальный анализ пробелов в навыках — коучинг, за который платят, теперь по запросу.' },
      { title: 'Движок роадмапов', body: 'Твой точный путь к роли, неделя за неделей — редактируемый, с вехами и 3D-видом.' },
      { title: 'Хаб обучения', body: 'Отобранные материалы и встроенный LMS — уроки, тесты и сертификаты, которые реально помогают устроиться.' },
      { title: 'Аналитика прогресса', body: 'Видно твой темп — серии, часы и карты навыков — а ИИ подсказывает, что починить, пока ты не застрял.' },
      { title: 'Подготовка к собеседованиям', body: 'Тренируй настоящие HR-, технические и поведенческие интервью с мгновенной оценкой — пока волнение не уйдёт.' },
      { title: 'Готовность к найму', body: 'Один балл 0–100 честно говорит, когда пора откликаться — и что подтянуть, если ещё рано.' },
    ],
  },
  pricing: {
    title: 'Простые тарифы',
    subtitle: 'Начни бесплатно сегодня. Переходи на Premium только когда решишь идти за оффером ва-банк.',
    perMonth: '/мес',
    mostPopular: 'Популярный',
    free: {
      name: 'Бесплатно',
      tagline: 'Найди своё направление',
      features: ['ИИ-HR-чат (базовый)', '1 персональная карта', 'Доступ к хабу обучения', 'Базовый трекер прогресса'],
      cta: 'Начать бесплатно',
    },
    premium: {
      name: 'Premium',
      tagline: 'Всё, чтобы получить работу',
      features: ['Безлимитные дорожные карты', 'Пробные собеседования', 'Глубокий анализ навыков', 'ИИ-инсайты обучения', 'Проверка резюме и готовность', 'Подтверждённые сертификаты'],
      cta: 'Перейти на Premium',
    },
  },
  ctaBand: {
    title: 'Хватит гадать. Пора получать офферы.',
    subtitle: 'Получи персональный план за две минуты — бесплатно. Твой следующий оффер ближе, чем кажется.',
    button: 'Начать бесплатно — без карты',
  },
  footer: {
    tagline: 'От первого шага до первого оффера.',
    rights: 'Все права защищены.',
  },
  ui: {
    lightMode: 'Светлая тема',
    darkMode: 'Тёмная тема',
    language: 'Язык',
  },
  pages: pagesRu,
};

const uz: Dict = {
  nav: {
    howItWorks: 'Qanday ishlaydi',
    features: 'Imkoniyatlar',
    pricing: 'Tariflar',
    signIn: 'Kirish',
    getStarted: 'Boshlash',
  },
  hero: {
    badge: 'Chalkashlikdan offergacha — AI bilan',
    titleQuestion: '«kim bo‘laman?»',
    titleAnswer: '«ishga qabul qilindim.»',
    from: '',
    to: '',
    subtitle:
      'Taxminlarni bas qiling. CareerOS sizga AI-HR murabbiy, bosqichma-bosqich reja va haqiqiy suhbatga tayyorgarlik beradi — toki oqim bo‘ylab suzishni to‘xtatib, offerlar ola boshlaysiz.',
    ctaPrimary: 'Rejamni olish — bepul',
    ctaSecondary: 'Menda hisob bor',
  },
  stats: {
    tracks: 'Karyera yo‘nalishlari',
    milestones: 'Tanlangan bosqichlar',
    readiness: 'Ishga tayyorlik bali',
    modules: 'Modul, bitta OS',
  },
  how: {
    title: 'CareerOS qanday ishlaydi',
    subtitle: 'Uch qadam. Bitta natija — offer.',
    step1Title: 'Yo‘nalishingizni toping',
    step1Body:
      'AI-HR bilan ikki daqiqalik suhbat — u kuchli tomonlaringiz va maqsadlaringizni o‘qiydi va sizga chindan yoqadigan kasblarni, yopish kerak bo‘lgan aniq bo‘shliqlar bilan beradi.',
    step2Title: 'Roadmapingizni oling',
    step2Body:
      'Haftama-hafta aniq reja — ko‘nikmalar, saralangan manbalar va haqiqiy loyihalar — darajangiz va jadvalingizga moslab. Tasodifiy darsliklar yo‘q.',
    step3Title: 'Ishga joylashing',
    step3Body:
      'O‘rganing, loyihalar yarating, tayyorlik bali o‘sishini kuzating va AI bilan suhbatlarni mashq qiling — toki xonaga kirish oson tuyulguncha.',
  },
  features: {
    title: 'Bitta platforma.',
    titleAccent: 'Har bir qadam.',
    subtitle: 'Endi o‘nlab oynalar, tashlab ketilgan kurslar va taxminlar yo‘q — sizni offergacha yetkazadigan bitta aniq tizim.',
    items: [
      { title: 'AI-HR maslahatchi', body: 'Halol shaxsiy yo‘l-yo‘riq va ko‘nikmalardagi bo‘shliqlarning haqiqiy tahlili — pul to‘lanadigan murabbiylik, endi talab bo‘yicha.' },
      { title: 'Roadmap mexanizmi', body: 'Lavozimga aniq yo‘lingiz, haftama-hafta — tahrirlanadigan, bosqichli va 3D’da ko‘rinadigan.' },
      { title: 'O‘quv markazi', body: 'Saralangan manbalar va ichki LMS — chindan ishga joylashishga yordam beradigan darslar, testlar va sertifikatlar.' },
      { title: 'Taraqqiyot tahlili', body: 'Sur’atingiz ko‘rinadi — seriyalar, soatlar va ko‘nikma xaritalari — AI esa siz to‘xtab qolishdan oldin nimani tuzatishni aytadi.' },
      { title: 'Suhbatga tayyorgarlik', body: 'Haqiqiy HR, texnik va xulq-atvor suhbatlarini bir zumda baho bilan mashq qiling — toki hayajon ketguncha.' },
      { title: 'Ishga tayyorlik', body: '0–100 lik bitta ball sizga qachon ariza berishga tayyorligingizni halol aytadi — va hali erta bo‘lsa, nimani tuzatishni.' },
    ],
  },
  pricing: {
    title: 'Oddiy tariflar',
    subtitle: 'Bugun bepul boshlang. Premiumga faqat offerga jiddiy kirishishga qaror qilganingizda o‘ting.',
    perMonth: '/oy',
    mostPopular: 'Ommabop',
    free: {
      name: 'Bepul',
      tagline: 'Yo‘nalishingizni toping',
      features: ['AI-HR chat (asosiy)', '1 shaxsiy yo‘l xaritasi', 'O‘quv markaziga kirish', 'Asosiy taraqqiyot kuzatuvi'],
      cta: 'Bepul boshlash',
    },
    premium: {
      name: 'Premium',
      tagline: 'Ishga joylashish uchun barchasi',
      features: ['Cheksiz yo‘l xaritalari', 'Sinov suhbatlari', 'Chuqur ko‘nikma tahlili', 'AI o‘quv tahlillari', 'Rezyume tahlili va tayyorlik', 'Tasdiqlangan sertifikatlar'],
      cta: 'Premiumga o‘tish',
    },
  },
  ctaBand: {
    title: 'Taxmin qilishni bas qiling. Offer olishni boshlang.',
    subtitle: 'Shaxsiy rejangizni ikki daqiqada oling — bepul. Keyingi offeringiz siz o‘ylagandan yaqinroq.',
    button: 'Bepul boshlash — karta shart emas',
  },
  footer: {
    tagline: 'Birinchi qadamdan birinchi offergacha.',
    rights: 'Barcha huquqlar himoyalangan.',
  },
  ui: {
    lightMode: 'Yorug‘ rejim',
    darkMode: 'Qorong‘i rejim',
    language: 'Til',
  },
  pages: pagesUz,
};

export const dictionaries: Record<Locale, Dict> = { ru, uz, en };
