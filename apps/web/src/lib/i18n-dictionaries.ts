/**
 * Translation dictionaries for CareerOS. Three locales: English, Russian, Uzbek.
 * Keys are shared 1:1 across locales — `en` is the canonical shape.
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
      'CareerOS guides you the whole way — an AI-HR consultant, a personalized roadmap, a learning hub, progress tracking and interview prep, all in one platform.',
    ctaPrimary: 'Start your journey',
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
    subtitle: 'Three steps from uncertainty to an offer.',
    step1Title: 'Talk to your AI consultant',
    step1Body:
      'Answer a short quiz and chat with an AI-HR consultant that understands your interests, strengths and goals — then recommends roles that actually fit.',
    step2Title: 'Get a personalized roadmap',
    step2Body:
      'A stage-by-stage plan — skills, curated resources, hands-on projects and milestones — tailored to your level and weekly hours.',
    step3Title: 'Learn, build & track',
    step3Body:
      'Follow the learning hub, complete projects, watch your skill heatmap and streak grow, and prep for interviews until you are job-ready.',
  },
  features: {
    title: 'One platform.',
    titleAccent: 'Every step.',
    subtitle: 'Stop juggling ten tabs. CareerOS is the operating system for your career.',
    items: [
      { title: 'AI-HR Consultant', body: 'Career guidance that returns real recommendations and a skill-gap analysis, not generic advice.' },
      { title: 'Roadmap Engine', body: 'Personalized, editable roadmaps with progress rings, milestones and a 3D path view.' },
      { title: 'Learning Hub', body: 'Curated resources plus an internal LMS with lessons, quizzes and certificates.' },
      { title: 'Progress Analytics', body: 'Streaks, weekly hours, skill heatmaps and AI insights into your pace and momentum.' },
      { title: 'Interview Prep', body: 'Turn-based mock HR, technical and behavioral interviews with scored feedback.' },
      { title: 'Job Readiness', body: 'A single 0–100 score from your skills, roadmap, resume and interview performance.' },
    ],
  },
  pricing: {
    title: 'Simple pricing',
    subtitle: 'Start free. Upgrade when you’re ready to get hired.',
    perMonth: '/mo',
    mostPopular: 'Most popular',
    free: {
      name: 'Free',
      tagline: 'Start exploring your path',
      features: ['AI-HR chat (basic)', '1 personalized roadmap', 'Learning hub access', 'Basic progress tracker'],
      cta: 'Start free',
    },
    premium: {
      name: 'Premium',
      tagline: 'Everything you need to get hired',
      features: ['Unlimited roadmaps', 'Mock interviews', 'Deep skill-gap analysis', 'AI learning insights', 'Resume review & job readiness', 'Verified certificates'],
      cta: 'Go Premium',
    },
  },
  ctaBand: {
    title: 'Your career, finally on autopilot.',
    subtitle: 'Join CareerOS and turn confusion into a clear, trackable plan toward the job you want.',
    button: 'Get started — it’s free',
  },
  marquee: {
    label: 'Powered by a modern learning stack',
  },
  footer: {
    tagline: 'Built as a flagship demo.',
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
      'CareerOS ведёт вас на всём пути — ИИ-HR-консультант, персональная дорожная карта, хаб обучения, отслеживание прогресса и подготовка к собеседованиям в одной платформе.',
    ctaPrimary: 'Начать путь',
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
    subtitle: 'Три шага от неопределённости до оффера.',
    step1Title: 'Поговорите с ИИ-консультантом',
    step1Body:
      'Пройдите короткий тест и пообщайтесь с ИИ-HR-консультантом, который понимает ваши интересы, сильные стороны и цели — и рекомендует роли, которые действительно вам подходят.',
    step2Title: 'Получите персональную дорожную карту',
    step2Body:
      'Поэтапный план — навыки, отобранные ресурсы, практические проекты и вехи — адаптированный под ваш уровень и часы в неделю.',
    step3Title: 'Учитесь, создавайте и отслеживайте',
    step3Body:
      'Следуйте хабу обучения, выполняйте проекты, наблюдайте за ростом карты навыков и серии, готовьтесь к собеседованиям — пока не будете готовы к работе.',
  },
  features: {
    title: 'Одна платформа.',
    titleAccent: 'Каждый шаг.',
    subtitle: 'Хватит жонглировать десятью вкладками. CareerOS — это операционная система вашей карьеры.',
    items: [
      { title: 'ИИ-HR-консультант', body: 'Карьерные советы с реальными рекомендациями и анализом пробелов в навыках, а не общие фразы.' },
      { title: 'Движок дорожных карт', body: 'Персональные редактируемые карты с кольцами прогресса, вехами и 3D-видом пути.' },
      { title: 'Хаб обучения', body: 'Отобранные ресурсы плюс внутренний LMS с уроками, тестами и сертификатами.' },
      { title: 'Аналитика прогресса', body: 'Серии, часы в неделю, тепловые карты навыков и ИИ-инсайты о вашем темпе.' },
      { title: 'Подготовка к собеседованиям', body: 'Пошаговые пробные HR-, технические и поведенческие интервью с оценкой.' },
      { title: 'Готовность к найму', body: 'Единый балл от 0 до 100 по навыкам, дорожной карте, резюме и собеседованиям.' },
    ],
  },
  pricing: {
    title: 'Простые тарифы',
    subtitle: 'Начните бесплатно. Переходите на Premium, когда будете готовы устроиться.',
    perMonth: '/мес',
    mostPopular: 'Популярный',
    free: {
      name: 'Бесплатно',
      tagline: 'Начните исследовать свой путь',
      features: ['ИИ-HR-чат (базовый)', '1 персональная карта', 'Доступ к хабу обучения', 'Базовый трекер прогресса'],
      cta: 'Начать бесплатно',
    },
    premium: {
      name: 'Premium',
      tagline: 'Всё, что нужно, чтобы вас наняли',
      features: ['Безлимитные дорожные карты', 'Пробные собеседования', 'Глубокий анализ навыков', 'ИИ-инсайты обучения', 'Проверка резюме и готовность', 'Подтверждённые сертификаты'],
      cta: 'Перейти на Premium',
    },
  },
  ctaBand: {
    title: 'Ваша карьера — наконец на автопилоте.',
    subtitle: 'Присоединяйтесь к CareerOS и превратите растерянность в чёткий, отслеживаемый план к желаемой работе.',
    button: 'Начать — это бесплатно',
  },
  marquee: {
    label: 'На основе современного стека обучения',
  },
  footer: {
    tagline: 'Создано как флагманское демо.',
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
      'CareerOS sizni butun yo‘l davomida boshqaradi — AI-HR maslahatchi, shaxsiy yo‘l xaritasi, o‘quv markazi, taraqqiyotni kuzatish va suhbatga tayyorgarlik — barchasi bitta platformada.',
    ctaPrimary: 'Yo‘lni boshlash',
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
    subtitle: 'Noaniqlikdan takliifgacha uch qadam.',
    step1Title: 'AI maslahatchi bilan suhbatlashing',
    step1Body:
      'Qisqa testdan o‘ting va qiziqishlaringiz, kuchli tomonlaringiz va maqsadlaringizni tushunadigan AI-HR maslahatchi bilan suhbatlashing — u sizga mos keladigan kasblarni tavsiya qiladi.',
    step2Title: 'Shaxsiy yo‘l xaritasini oling',
    step2Body:
      'Bosqichma-bosqich reja — ko‘nikmalar, tanlangan resurslar, amaliy loyihalar va bosqichlar — darajangiz va haftalik soatlaringizga moslashtirilgan.',
    step3Title: 'O‘rganing, yarating va kuzating',
    step3Body:
      'O‘quv markazini kuzating, loyihalarni bajaring, ko‘nikmalar xaritangiz va seriyangiz o‘sishini ko‘ring, ishga tayyor bo‘lguningizcha suhbatlarga tayyorlaning.',
  },
  features: {
    title: 'Bitta platforma.',
    titleAccent: 'Har bir qadam.',
    subtitle: 'O‘nlab oynalar bilan ovora bo‘lishni bas qiling. CareerOS — karyerangiz operatsion tizimi.',
    items: [
      { title: 'AI-HR maslahatchi', body: 'Umumiy maslahat emas, balki haqiqiy tavsiyalar va ko‘nikma tahlilini beruvchi karyera yo‘riqnomasi.' },
      { title: 'Yo‘l xaritasi mexanizmi', body: 'Taraqqiyot halqalari, bosqichlar va 3D yo‘l ko‘rinishi bilan shaxsiy, tahrirlanadigan xaritalar.' },
      { title: 'O‘quv markazi', body: 'Tanlangan resurslar hamda darslar, testlar va sertifikatlar bilan ichki LMS.' },
      { title: 'Taraqqiyot tahlili', body: 'Seriyalar, haftalik soatlar, ko‘nikma xaritalari va sur’atingiz haqida AI tahlillari.' },
      { title: 'Suhbatga tayyorgarlik', body: 'Baholanadigan sinov HR, texnik va xulq-atvor suhbatlari.' },
      { title: 'Ishga tayyorlik', body: 'Ko‘nikmalar, yo‘l xaritasi, rezyume va suhbatlardan yagona 0–100 ball.' },
    ],
  },
  pricing: {
    title: 'Oddiy tariflar',
    subtitle: 'Bepul boshlang. Ishga joylashishga tayyor bo‘lganingizda yangilang.',
    perMonth: '/oy',
    mostPopular: 'Ommabop',
    free: {
      name: 'Bepul',
      tagline: 'Yo‘lingizni o‘rganishni boshlang',
      features: ['AI-HR chat (asosiy)', '1 shaxsiy yo‘l xaritasi', 'O‘quv markaziga kirish', 'Asosiy taraqqiyot kuzatuvi'],
      cta: 'Bepul boshlash',
    },
    premium: {
      name: 'Premium',
      tagline: 'Ishga joylashish uchun barcha kerakli narsalar',
      features: ['Cheksiz yo‘l xaritalari', 'Sinov suhbatlari', 'Chuqur ko‘nikma tahlili', 'AI o‘quv tahlillari', 'Rezyume tahlili va tayyorlik', 'Tasdiqlangan sertifikatlar'],
      cta: 'Premiumga o‘tish',
    },
  },
  ctaBand: {
    title: 'Karyerangiz — nihoyat avtopilotda.',
    subtitle: 'CareerOS ga qo‘shiling va sarosimani orzuingizdagi ishga aniq, kuzatiladigan rejaga aylantiring.',
    button: 'Boshlash — bu bepul',
  },
  marquee: {
    label: 'Zamonaviy o‘quv steki asosida',
  },
  footer: {
    tagline: 'Flagman demo sifatida yaratilgan.',
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
