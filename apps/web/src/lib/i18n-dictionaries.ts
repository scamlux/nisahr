/**
 * Translation dictionaries for CareerOS. Three locales: English, Russian, Uzbek.
 * Keys are shared 1:1 across locales — `en` is the canonical shape.
 * Landing copy is written to read natively per language, not translated 1:1.
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
    badge: 'AI Career Operating System',
    titleQuestion: '“what do I become?”',
    titleAnswer: '“I got the job.”',
    from: 'From',
    to: 'to',
    subtitle:
      'From that first foggy question to a signed offer — an AI-HR consultant, a roadmap built around you, a learning hub and interview prep, all in one place.',
    ctaPrimary: 'Start free',
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
    subtitle: 'Three steps from lost to hired.',
    step1Title: 'Meet your AI career consultant',
    step1Body:
      'Take a two-minute quiz and talk to an AI-HR that actually gets your interests, strengths and goals — then points you to roles worth chasing.',
    step2Title: 'Get a roadmap built around you',
    step2Body:
      'A stage-by-stage plan — skills, hand-picked resources, real projects and milestones — tuned to your level and the hours you can spare each week.',
    step3Title: 'Learn, build, get hired',
    step3Body:
      'Move through the learning hub, ship projects, watch your streak and skill map climb, and rehearse interviews until the offer feels inevitable.',
  },
  features: {
    title: 'One platform.',
    titleAccent: 'Every step.',
    subtitle: 'Stop juggling ten tabs and half-finished courses. CareerOS is the operating system for your career.',
    items: [
      { title: 'AI-HR Consultant', body: 'Real recommendations and an honest skill-gap read — not recycled, one-size-fits-all advice.' },
      { title: 'Roadmap Engine', body: 'Personalized, editable roadmaps with progress rings, milestones and a path you can see in 3D.' },
      { title: 'Learning Hub', body: 'Curated resources plus a built-in LMS: lessons, quizzes and certificates that actually mean something.' },
      { title: 'Progress Analytics', body: 'Streaks, weekly hours and skill heatmaps, with AI reading your pace and momentum.' },
      { title: 'Interview Prep', body: 'Mock HR, technical and behavioral interviews, turn by turn, with scored, specific feedback.' },
      { title: 'Job Readiness', body: 'One honest 0–100 score from your skills, roadmap, resume and interview performance.' },
    ],
  },
  pricing: {
    title: 'Simple pricing',
    subtitle: 'Start free. Go Premium the day you decide to get hired.',
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
    title: 'Your career, finally on autopilot.',
    subtitle: 'Turn a vague “someday” into a plan you can see, track and finish — right up to the offer.',
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
    badge: 'ИИ-операционная система карьеры',
    titleQuestion: '«кем мне стать?»',
    titleAnswer: '«меня взяли на работу.»',
    from: 'От',
    to: 'к',
    subtitle:
      'От первого туманного вопроса до подписанного оффера — ИИ-HR-консультант, дорожная карта под тебя, хаб обучения и подготовка к собеседованиям в одном месте.',
    ctaPrimary: 'Начать бесплатно',
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
    subtitle: 'Три шага — от «я потерян» до оффера.',
    step1Title: 'Знакомство с ИИ-консультантом',
    step1Body:
      'Пройди двухминутный тест и поговори с ИИ-HR, который правда понимает твои интересы, сильные стороны и цели — и подскажет роли, за которые стоит браться.',
    step2Title: 'Дорожная карта под тебя',
    step2Body:
      'Пошаговый план — навыки, отобранные материалы, реальные проекты и вехи — под твой уровень и то количество часов, что есть в неделю.',
    step3Title: 'Учись, создавай, получай оффер',
    step3Body:
      'Проходи хаб обучения, делай проекты, следи, как растут серия и карта навыков, тренируй собеседования — пока оффер не станет делом времени.',
  },
  features: {
    title: 'Одна платформа.',
    titleAccent: 'Каждый шаг.',
    subtitle: 'Хватит жонглировать десятком вкладок и брошенных курсов. CareerOS — операционная система твоей карьеры.',
    items: [
      { title: 'ИИ-HR-консультант', body: 'Живые рекомендации и честный разбор пробелов в навыках — а не переписанные общие советы.' },
      { title: 'Движок дорожных карт', body: 'Персональные редактируемые карты с кольцами прогресса, вехами и путём, который видно в 3D.' },
      { title: 'Хаб обучения', body: 'Отобранные материалы плюс встроенный LMS: уроки, тесты и сертификаты, которые что-то значат.' },
      { title: 'Аналитика прогресса', body: 'Серии, часы за неделю и тепловые карты навыков, а ИИ считывает твой темп.' },
      { title: 'Подготовка к собеседованиям', body: 'Пробные HR-, технические и поведенческие интервью, ход за ходом, с конкретной оценкой.' },
      { title: 'Готовность к найму', body: 'Один честный балл 0–100 по навыкам, карте, резюме и собеседованиям.' },
    ],
  },
  pricing: {
    title: 'Простые тарифы',
    subtitle: 'Начни бесплатно. Перейдёшь на Premium в день, когда решишь устроиться.',
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
    title: 'Карьера — наконец на автопилоте.',
    subtitle: 'Преврати размытое «когда-нибудь» в план, который видно, можно отследить и довести до оффера.',
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
    badge: 'Karyera uchun AI operatsion tizimi',
    titleQuestion: '«kim bo‘laman?»',
    titleAnswer: '«ishga qabul qilindim.»',
    from: '',
    to: '',
    subtitle:
      'Birinchi noaniq savoldan imzolangan offergacha — AI-HR maslahatchi, siz uchun tuzilgan yo‘l xaritasi, o‘quv markazi va suhbatga tayyorgarlik, barchasi bitta joyda.',
    ctaPrimary: 'Bepul boshlash',
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
    subtitle: 'Noaniqlikdan offergacha uch qadam.',
    step1Title: 'AI maslahatchi bilan tanishing',
    step1Body:
      'Ikki daqiqalik testdan o‘ting va qiziqishlaringiz, kuchli tomonlaringiz va maqsadlaringizni chindan tushunadigan AI-HR bilan suhbatlashing — u sizga arziydigan kasblarni ko‘rsatadi.',
    step2Title: 'Siz uchun tuzilgan yo‘l xaritasi',
    step2Body:
      'Bosqichma-bosqich reja — ko‘nikmalar, saralangan manbalar, haqiqiy loyihalar va bosqichlar — darajangiz va haftada ajrata oladigan soatlaringizga moslab.',
    step3Title: 'O‘rganing, yarating, ishga joylashing',
    step3Body:
      'O‘quv markazidan o‘ting, loyihalar yarating, seriyangiz va ko‘nikma xaritangiz o‘sishini kuzating, offer muqarrar tuyulguncha suhbatlarni mashq qiling.',
  },
  features: {
    title: 'Bitta platforma.',
    titleAccent: 'Har bir qadam.',
    subtitle: 'O‘nlab oynalar va tashlab ketilgan kurslar bilan ovora bo‘lishni bas qiling. CareerOS — karyerangiz operatsion tizimi.',
    items: [
      { title: 'AI-HR maslahatchi', body: 'Jonli tavsiyalar va ko‘nikmalardagi bo‘shliqlarning halol tahlili — qayta yozilgan umumiy maslahat emas.' },
      { title: 'Yo‘l xaritasi mexanizmi', body: 'Taraqqiyot halqalari, bosqichlar va 3D’da ko‘rinadigan yo‘l bilan shaxsiy, tahrirlanadigan xaritalar.' },
      { title: 'O‘quv markazi', body: 'Saralangan manbalar va ichki LMS: chindan qadrlanadigan darslar, testlar va sertifikatlar.' },
      { title: 'Taraqqiyot tahlili', body: 'Seriyalar, haftalik soatlar va ko‘nikma xaritalari, AI esa sur’atingizni o‘qiydi.' },
      { title: 'Suhbatga tayyorgarlik', body: 'Sinov HR, texnik va xulq-atvor suhbatlari, qadam-baqadam, aniq baho bilan.' },
      { title: 'Ishga tayyorlik', body: 'Ko‘nikma, xarita, rezyume va suhbatlar bo‘yicha bitta halol 0–100 ball.' },
    ],
  },
  pricing: {
    title: 'Oddiy tariflar',
    subtitle: 'Bepul boshlang. Ishga joylashishga qaror qilgan kuningiz Premium’ga o‘ting.',
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
    title: 'Karyerangiz — nihoyat avtopilotda.',
    subtitle: 'Noaniq «qachondir» ni ko‘rinadigan, kuzatib boriladigan va offergacha yetkaziladigan rejaga aylantiring.',
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
