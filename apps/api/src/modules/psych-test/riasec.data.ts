/**
 * RIASEC (Holland Codes) question bank + profession catalog.
 * The bank is versioned in code: identical answers against the same version
 * always produce the identical profile (scoring is pure arithmetic, no LLM).
 */

export const PSYCH_TEST_VERSION = 'riasec-v1';

export type RiasecAxis = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export const AXES: RiasecAxis[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export interface LocalizedText {
  en: string;
  ru: string;
  uz: string;
}

export const AXIS_LABELS: Record<RiasecAxis, LocalizedText> = {
  R: { en: 'Realistic (hands-on)', ru: 'Реалистичный (практик)', uz: 'Realistik (amaliyotchi)' },
  I: { en: 'Investigative (analyst)', ru: 'Исследовательский (аналитик)', uz: 'Tadqiqotchi (tahlilchi)' },
  A: { en: 'Artistic (creator)', ru: 'Артистичный (творец)', uz: 'Ijodkor (yaratuvchi)' },
  S: { en: 'Social (helper)', ru: 'Социальный (наставник)', uz: 'Ijtimoiy (yordamchi)' },
  E: { en: 'Enterprising (leader)', ru: 'Предприимчивый (лидер)', uz: 'Tadbirkor (yetakchi)' },
  C: { en: 'Conventional (organizer)', ru: 'Организованный (систематик)', uz: 'Tartibli (tashkilotchi)' },
};

export interface PsychQuestion {
  id: string;
  axis: RiasecAxis;
  text: LocalizedText;
}

/** 24 Likert statements (1 = strongly disagree … 5 = strongly agree), 4 per axis. */
export const QUESTIONS: PsychQuestion[] = [
  // R — Realistic
  { id: 'r1', axis: 'R', text: { en: 'I enjoy assembling, repairing or configuring devices and tools.', ru: 'Мне нравится собирать, чинить или настраивать устройства и инструменты.', uz: "Qurilma va asboblarni yig'ish, tuzatish yoki sozlash menga yoqadi." } },
  { id: 'r2', axis: 'R', text: { en: 'I prefer practical tasks with a visible, tangible result.', ru: 'Я предпочитаю практические задачи с видимым, осязаемым результатом.', uz: "Ko'rinadigan, aniq natijali amaliy vazifalarni afzal ko'raman." } },
  { id: 'r3', axis: 'R', text: { en: 'I would rather build something myself than read a long report about it.', ru: 'Я лучше сделаю что-то своими руками, чем прочитаю про это длинный отчёт.', uz: "Uzun hisobot o'qigandan ko'ra, biror narsani o'zim yasaganim yaxshi." } },
  { id: 'r4', axis: 'R', text: { en: 'Setting up hardware, networks or servers sounds interesting to me.', ru: 'Настройка оборудования, сетей или серверов кажется мне интересной.', uz: 'Uskuna, tarmoq yoki serverlarni sozlash menga qiziq tuyuladi.' } },
  // I — Investigative
  { id: 'i1', axis: 'I', text: { en: 'I love digging into why something works the way it does.', ru: 'Мне нравится разбираться, почему что-то работает именно так.', uz: 'Biror narsa nega aynan shunday ishlashini chuqur o‘rganish menga yoqadi.' } },
  { id: 'i2', axis: 'I', text: { en: 'Solving logic puzzles or debugging problems is satisfying for me.', ru: 'Решение логических задач и поиск ошибок приносит мне удовольствие.', uz: 'Mantiqiy masalalar yechish yoki xatolarni topish menga zavq beradi.' } },
  { id: 'i3', axis: 'I', text: { en: 'I like analyzing data to find patterns and insights.', ru: 'Мне нравится анализировать данные, находить закономерности и выводы.', uz: "Ma'lumotlarni tahlil qilib, qonuniyat va xulosalar topish menga yoqadi." } },
  { id: 'i4', axis: 'I', text: { en: 'Before deciding, I research the topic deeply and compare sources.', ru: 'Перед решением я глубоко изучаю тему и сравниваю источники.', uz: "Qaror qabul qilishdan oldin mavzuni chuqur o'rganib, manbalarni solishtiraman." } },
  // A — Artistic
  { id: 'a1', axis: 'A', text: { en: 'I enjoy designing how things look and feel.', ru: 'Мне нравится придумывать, как вещи выглядят и ощущаются.', uz: "Narsalarning ko'rinishi va his etilishini o'ylab topish menga yoqadi." } },
  { id: 'a2', axis: 'A', text: { en: 'I often come up with unusual, creative solutions.', ru: 'Я часто придумываю необычные, креативные решения.', uz: "Ko'pincha g'ayrioddiy, ijodiy yechimlar o'ylab topaman." } },
  { id: 'a3', axis: 'A', text: { en: 'Writing, drawing, music or content creation attracts me.', ru: 'Меня привлекают письмо, рисование, музыка или создание контента.', uz: 'Yozish, rasm chizish, musiqa yoki kontent yaratish meni qiziqtiradi.' } },
  { id: 'a4', axis: 'A', text: { en: 'Strict rules and rigid templates make work boring for me.', ru: 'Жёсткие правила и шаблоны делают работу скучной для меня.', uz: "Qattiq qoidalar va qoliplar ish jarayonini men uchun zerikarli qiladi." } },
  // S — Social
  { id: 's1', axis: 'S', text: { en: 'I enjoy explaining difficult things to other people.', ru: 'Мне нравится объяснять людям сложные вещи.', uz: 'Odamlarga murakkab narsalarni tushuntirish menga yoqadi.' } },
  { id: 's2', axis: 'S', text: { en: 'Helping someone grow or solve their problem energizes me.', ru: 'Помогать кому-то расти или решать проблемы — заряжает меня.', uz: "Kimgadir o'sishga yoki muammosini hal qilishga yordam berish menga kuch beradi." } },
  { id: 's3', axis: 'S', text: { en: 'I prefer working in a team over working completely alone.', ru: 'Я предпочитаю командную работу полностью самостоятельной.', uz: "Butunlay yolg'iz ishlashdan ko'ra jamoada ishlashni afzal ko'raman." } },
  { id: 's4', axis: 'S', text: { en: 'People often come to me for advice or support.', ru: 'Люди часто обращаются ко мне за советом или поддержкой.', uz: "Odamlar tez-tez mendan maslahat yoki yordam so'rashadi." } },
  // E — Enterprising
  { id: 'e1', axis: 'E', text: { en: 'I like leading projects and convincing people of ideas.', ru: 'Мне нравится вести проекты и убеждать людей в идеях.', uz: "Loyihalarni boshqarish va odamlarni g'oyalarga ishontirish menga yoqadi." } },
  { id: 'e2', axis: 'E', text: { en: 'Negotiating, pitching and presenting feel natural to me.', ru: 'Переговоры, питчи и презентации даются мне естественно.', uz: 'Muzokara, taqdimot va loyihani himoya qilish men uchun tabiiy.' } },
  { id: 'e3', axis: 'E', text: { en: 'I am ready to take risks for a bigger result.', ru: 'Я готов рисковать ради более крупного результата.', uz: 'Kattaroq natija uchun tavakkal qilishga tayyorman.' } },
  { id: 'e4', axis: 'E', text: { en: 'I like setting ambitious goals and driving others toward them.', ru: 'Мне нравится ставить амбициозные цели и вести к ним других.', uz: "Katta maqsadlar qo'yib, boshqalarni ularga yetaklash menga yoqadi." } },
  // C — Conventional
  { id: 'c1', axis: 'C', text: { en: 'I keep my files, notes and plans well organized.', ru: 'Мои файлы, заметки и планы всегда хорошо организованы.', uz: 'Fayllarim, yozuvlarim va rejalarim doim tartibli.' } },
  { id: 'c2', axis: 'C', text: { en: 'I enjoy processes with clear rules, checklists and standards.', ru: 'Мне нравятся процессы с чёткими правилами, чек-листами и стандартами.', uz: "Aniq qoidalar, cheklist va standartlarga ega jarayonlar menga yoqadi." } },
  { id: 'c3', axis: 'C', text: { en: 'I notice small errors and inconsistencies that others miss.', ru: 'Я замечаю мелкие ошибки и несостыковки, которые другие пропускают.', uz: "Boshqalar o'tkazib yuboradigan mayda xato va nomuvofiqliklarni sezaman." } },
  { id: 'c4', axis: 'C', text: { en: 'I like planning work in advance instead of improvising.', ru: 'Я предпочитаю планировать работу заранее, а не импровизировать.', uz: "Ishni improvizatsiya emas, oldindan rejalashtirishni afzal ko'raman." } },
];

export interface ProfessionDef {
  slug: string;
  title: string;
  vector: Partial<Record<RiasecAxis, number>>;
  entryDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedMonths: number;
  blurb: LocalizedText;
}

/** Deterministic axis→profession map. Vector weights sum to 1 per profession. */
export const PROFESSIONS: ProfessionDef[] = [
  {
    slug: 'frontend-developer', title: 'Frontend Developer',
    vector: { I: 0.3, A: 0.3, C: 0.25, R: 0.15 },
    entryDifficulty: 'MEDIUM', estimatedMonths: 6,
    blurb: {
      en: 'you build visible products where logic meets design — interfaces people touch every day.',
      ru: 'вы создаёте видимый продукт на стыке логики и дизайна — интерфейсы, которыми люди пользуются каждый день.',
      uz: "siz mantiq va dizayn tutashgan ko'rinadigan mahsulot — odamlar har kuni ishlatadigan interfeyslarni yaratasiz.",
    },
  },
  {
    slug: 'backend-developer', title: 'Backend Developer',
    vector: { I: 0.45, C: 0.35, R: 0.2 },
    entryDifficulty: 'MEDIUM', estimatedMonths: 8,
    blurb: {
      en: 'you design the logic, data and systems that power applications behind the scenes.',
      ru: 'вы проектируете логику, данные и системы, на которых держатся приложения.',
      uz: 'siz ilovalarni harakatga keltiruvchi mantiq, maʼlumotlar va tizimlarni loyihalaysiz.',
    },
  },
  {
    slug: 'fullstack-developer', title: 'Fullstack Developer',
    vector: { I: 0.4, C: 0.3, A: 0.15, R: 0.15 },
    entryDifficulty: 'HARD', estimatedMonths: 10,
    blurb: {
      en: 'you own features end-to-end — from the database to the pixel.',
      ru: 'вы отвечаете за фичи целиком — от базы данных до пикселя.',
      uz: "siz funksiyalarga to'liq egalik qilasiz — maʼlumotlar bazasidan pikselgacha.",
    },
  },
  {
    slug: 'data-analyst', title: 'Data Analyst',
    vector: { I: 0.45, C: 0.4, E: 0.15 },
    entryDifficulty: 'MEDIUM', estimatedMonths: 6,
    blurb: {
      en: 'you turn raw numbers into decisions with SQL, dashboards and clear stories.',
      ru: 'вы превращаете сырые цифры в решения с помощью SQL, дашбордов и понятных выводов.',
      uz: "siz SQL, dashboardlar va aniq xulosalar orqali xom raqamlarni qarorlarga aylantirasiz.",
    },
  },
  {
    slug: 'ai-engineer', title: 'AI Engineer',
    vector: { I: 0.6, C: 0.2, A: 0.1, R: 0.1 },
    entryDifficulty: 'HARD', estimatedMonths: 12,
    blurb: {
      en: 'you research, train and ship machine-learning systems — the deepest technical path.',
      ru: 'вы исследуете, обучаете и внедряете ML-системы — самый глубокий технический путь.',
      uz: "siz ML tizimlarini o'rganasiz, o'qitasiz va joriy qilasiz — eng chuqur texnik yo'nalish.",
    },
  },
  {
    slug: 'ui-ux-designer', title: 'UI/UX Designer',
    vector: { A: 0.5, S: 0.2, I: 0.15, E: 0.15 },
    entryDifficulty: 'MEDIUM', estimatedMonths: 6,
    blurb: {
      en: 'you shape how products look, feel and guide people — creativity with empathy.',
      ru: 'вы определяете, как продукт выглядит, ощущается и ведёт людей — творчество плюс эмпатия.',
      uz: "siz mahsulot qanday ko'rinishi, his etilishi va odamlarni yo'naltirishini belgilaysiz — ijod va empatiya.",
    },
  },
  {
    slug: 'product-manager', title: 'Product Manager',
    vector: { E: 0.4, S: 0.3, I: 0.2, C: 0.1 },
    entryDifficulty: 'HARD', estimatedMonths: 12,
    blurb: {
      en: 'you decide what gets built and why, aligning users, business and engineers.',
      ru: 'вы решаете, что и зачем строить, объединяя пользователей, бизнес и инженеров.',
      uz: 'siz nima va nega qurilishini hal qilasiz — foydalanuvchi, biznes va muhandislarni birlashtirasiz.',
    },
  },
  {
    slug: 'qa-engineer', title: 'QA Engineer',
    vector: { C: 0.45, I: 0.35, R: 0.2 },
    entryDifficulty: 'EASY', estimatedMonths: 4,
    blurb: {
      en: 'you protect quality — finding what breaks before users ever see it.',
      ru: 'вы охраняете качество — находите поломки раньше, чем их увидят пользователи.',
      uz: 'siz sifatni himoya qilasiz — foydalanuvchi ko‘rmasidan oldin xatolarni topasiz.',
    },
  },
  {
    slug: 'devops-engineer', title: 'DevOps Engineer',
    vector: { R: 0.35, C: 0.35, I: 0.3 },
    entryDifficulty: 'HARD', estimatedMonths: 12,
    blurb: {
      en: 'you automate infrastructure, deployments and reliability at scale.',
      ru: 'вы автоматизируете инфраструктуру, деплой и надёжность в масштабе.',
      uz: 'siz infratuzilma, deploy va ishonchlilikni keng miqyosda avtomatlashtirasiz.',
    },
  },
  {
    slug: 'mobile-developer', title: 'Mobile Developer',
    vector: { I: 0.35, A: 0.25, C: 0.25, R: 0.15 },
    entryDifficulty: 'MEDIUM', estimatedMonths: 8,
    blurb: {
      en: 'you craft the apps living in everyone’s pocket — iOS, Android or both.',
      ru: 'вы создаёте приложения, которые живут в кармане у каждого — iOS, Android или оба.',
      uz: "siz har kimning cho'ntagida yashaydigan ilovalarni yaratasiz — iOS, Android yoki ikkalasi.",
    },
  },
  {
    slug: 'digital-marketer', title: 'Digital Marketer',
    vector: { E: 0.45, A: 0.3, S: 0.25 },
    entryDifficulty: 'EASY', estimatedMonths: 5,
    blurb: {
      en: 'you grow products with campaigns, content and experiments.',
      ru: 'вы растите продукты через кампании, контент и эксперименты.',
      uz: 'siz kampaniyalar, kontent va tajribalar orqali mahsulotni o‘stirasiz.',
    },
  },
  {
    slug: 'project-manager', title: 'Project Manager',
    vector: { E: 0.35, S: 0.35, C: 0.3 },
    entryDifficulty: 'MEDIUM', estimatedMonths: 8,
    blurb: {
      en: 'you turn chaos into shipped work — plans, people and deadlines.',
      ru: 'вы превращаете хаос в готовый результат — планы, люди и дедлайны.',
      uz: 'siz tartibsizlikni tayyor natijaga aylantirasiz — rejalar, odamlar va muddatlar.',
    },
  },
  {
    slug: 'technical-writer', title: 'Technical Writer',
    vector: { A: 0.35, C: 0.35, I: 0.3 },
    entryDifficulty: 'EASY', estimatedMonths: 5,
    blurb: {
      en: 'you make complex technology understandable through clear writing.',
      ru: 'вы делаете сложные технологии понятными через ясные тексты.',
      uz: 'siz murakkab texnologiyalarni aniq matnlar orqali tushunarli qilasiz.',
    },
  },
  {
    slug: 'cybersecurity-analyst', title: 'Cybersecurity Analyst',
    vector: { I: 0.4, C: 0.35, R: 0.25 },
    entryDifficulty: 'HARD', estimatedMonths: 12,
    blurb: {
      en: 'you think like an attacker to defend systems and data.',
      ru: 'вы мыслите как атакующий, чтобы защищать системы и данные.',
      uz: "siz tizim va maʼlumotlarni himoya qilish uchun hujumchi kabi fikrlaysiz.",
    },
  },
  {
    slug: 'hr-people-ops', title: 'HR / People Operations',
    vector: { S: 0.5, E: 0.3, C: 0.2 },
    entryDifficulty: 'EASY', estimatedMonths: 5,
    blurb: {
      en: 'you build teams and help people thrive at work.',
      ru: 'вы строите команды и помогаете людям расти на работе.',
      uz: "siz jamoalar qurasiz va odamlarga ishda o'sishga yordam berasiz.",
    },
  },
];

export const REASON_TEMPLATES: Record<'en' | 'ru' | 'uz', (axes: string, blurb: string) => string> = {
  en: (axes, blurb) => `Your profile is strongest in ${axes} — ${blurb}`,
  ru: (axes, blurb) => `Ваш профиль сильнее всего в осях ${axes} — ${blurb}`,
  uz: (axes, blurb) => `Sizning profilingiz ${axes} o'qlarida eng kuchli — ${blurb}`,
};
