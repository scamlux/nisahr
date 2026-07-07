export type GraphResourceKind =
  | 'FREE_VIDEO'
  | 'OFFICIAL_DOC'
  | 'POPULAR'
  | 'PAID_COURSE'
  | 'ARTICLE'
  | 'PRACTICE';

export interface GraphResourceDef {
  kind: GraphResourceKind;
  provider: string;
  url: string;
  title: string;
  durationMin: number;
  lang: 'en' | 'ru' | 'uz';
}

export interface GraphNodeDef {
  key: string; // unique within a template; referenced by edges
  title: string;
  description: string;
  group: string; // section label, e.g. 'Foundations'
  type: 'TOPIC' | 'SUBTOPIC' | 'OPTIONAL';
  resources: GraphResourceDef[];
}

export interface GraphEdgeDef {
  from: string;
  to: string;
  kind: 'REQUIRED' | 'OPTIONAL';
}

export interface RoadmapGraphTemplate {
  slug: string;
  title: string;
  description: { en: string; ru: string; uz: string };
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedWeeks: number;
  tags: string[];
  nodes: GraphNodeDef[];
  edges: GraphEdgeDef[];
}

// ---------------------------------------------------------------------------
// Frontend Developer
// ---------------------------------------------------------------------------

const frontendDeveloper: RoadmapGraphTemplate = {
  slug: 'frontend-developer',
  title: 'Frontend Developer',
  description: {
    en: 'Become a job-ready frontend developer: HTML, CSS, JavaScript, a modern framework, tooling, and deployment.',
    ru: 'Станьте востребованным фронтенд-разработчиком: HTML, CSS, JavaScript, современный фреймворк, инструменты и деплой.',
    uz: 'Frontend dasturchi boʻlib yetishing: HTML, CSS, JavaScript, zamonaviy freymvork, vositalar va deploy.',
  },
  difficulty: 'MEDIUM',
  estimatedWeeks: 16,
  tags: ['frontend', 'web', 'javascript', 'react', 'html', 'css'],
  nodes: [
    {
      key: 'internet-basics',
      title: 'How the Internet Works',
      description: 'Understand what happens between typing a URL and seeing a page: DNS, hosting, HTTP, and browsers.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'freeCodeCamp.org channel', durationMin: 45, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work', title: 'How does the Internet work?', durationMin: 20, lang: 'en' },
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/frontend', title: 'Frontend Developer Roadmap', durationMin: 15, lang: 'en' },
      ],
    },
    {
      key: 'html',
      title: 'HTML Fundamentals',
      description: 'Learn semantic markup, forms, accessibility basics, and how to structure a real web page.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML', title: 'HTML: Structuring the web', durationMin: 30, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TraversyMedia', title: 'Traversy Media channel', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', title: 'Responsive Web Design Certification', durationMin: 300, lang: 'en' },
        { kind: 'ARTICLE', provider: 'learn.javascript.ru', url: 'https://learn.javascript.ru/dom-nodes', title: 'DOM: узлы документа', durationMin: 20, lang: 'ru' },
      ],
    },
    {
      key: 'html-forms',
      title: 'Forms & Validation',
      description: 'Build accessible forms with native HTML validation before reaching for JavaScript.',
      group: 'Foundations',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/Forms', title: 'MDN: Web forms', durationMin: 30, lang: 'en' },
        { kind: 'ARTICLE', provider: 'web.dev', url: 'https://web.dev/learn/forms/', title: 'Learn Forms', durationMin: 25, lang: 'en' },
      ],
    },
    {
      key: 'css',
      title: 'CSS Fundamentals',
      description: 'Master selectors, the box model, positioning, and responsive design with modern CSS.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', title: 'CSS: Cascading Style Sheets', durationMin: 30, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@KevinPowell', title: 'Kevin Powell channel', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Frontend Mentor', url: 'https://www.frontendmentor.io/challenges', title: 'Frontend Mentor challenges', durationMin: 240, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Udemy', url: 'https://www.udemy.com/topic/css/', title: 'CSS courses on Udemy', durationMin: 1200, lang: 'en' },
      ],
    },
    {
      key: 'css-layout',
      title: 'Flexbox & Grid',
      description: 'Learn the two layout systems that power virtually all modern web layouts.',
      group: 'Foundations',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@Wesbos', title: 'Wes Bos channel', durationMin: 45, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Codewars', url: 'https://flexboxfroggy.com/', title: 'Flexbox Froggy', durationMin: 60, lang: 'en' },
      ],
    },
    {
      key: 'css-preprocessors',
      title: 'Sass',
      description: 'A CSS preprocessor that adds variables, nesting, and mixins — still common in legacy codebases.',
      group: 'Foundations',
      type: 'OPTIONAL',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Sass', url: 'https://sass-lang.com/documentation/', title: 'Sass documentation', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'javascript',
      title: 'JavaScript Fundamentals',
      description: 'Learn variables, functions, control flow, arrays, objects, and the DOM API.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', title: 'JavaScript guide', durationMin: 40, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'JavaScript Full Course', durationMin: 180, lang: 'en' },
        { kind: 'PRACTICE', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', title: 'JS Algorithms and Data Structures', durationMin: 600, lang: 'en' },
        { kind: 'POPULAR', provider: 'javascript.info', url: 'https://javascript.info/', title: 'The Modern JavaScript Tutorial', durationMin: 300, lang: 'en' },
        { kind: 'ARTICLE', provider: 'learn.javascript.ru', url: 'https://learn.javascript.ru/', title: 'Современный учебник JavaScript', durationMin: 300, lang: 'ru' },
      ],
    },
    {
      key: 'js-dom',
      title: 'DOM Manipulation',
      description: 'Select, create, and update elements dynamically; handle events without a framework.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model', title: 'Introduction to the DOM', durationMin: 25, lang: 'en' },
        { kind: 'PRACTICE', provider: 'JavaScript30', url: 'https://javascript30.com/', title: '30 Day Vanilla JS Challenge', durationMin: 300, lang: 'en' },
      ],
    },
    {
      key: 'js-async',
      title: 'Async JavaScript',
      description: 'Understand callbacks, Promises, async/await, and fetching data from APIs.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous', title: 'Asynchronous JavaScript', durationMin: 40, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@akshaymarch7', title: 'Akshay Saini - Namaste JavaScript', durationMin: 90, lang: 'en' },
      ],
    },
    {
      key: 'ts',
      title: 'TypeScript',
      description: 'Add static types to JavaScript to catch bugs earlier and scale codebases confidently.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'TypeScript', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', title: 'TypeScript Handbook', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@ProgrammingwithMosh', title: 'TypeScript Tutorial for Beginners', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Exercism', url: 'https://exercism.org/tracks/typescript', title: 'TypeScript track', durationMin: 300, lang: 'en' },
      ],
    },
    {
      key: 'git',
      title: 'Version Control (Git & GitHub)',
      description: 'Track changes, branch, merge, and collaborate using Git and GitHub.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Git', url: 'https://git-scm.com/doc', title: 'Git documentation', durationMin: 30, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'Git and GitHub for Beginners', durationMin: 70, lang: 'en' },
        { kind: 'PRACTICE', provider: 'GitHub', url: 'https://skills.github.com/', title: 'GitHub Skills', durationMin: 120, lang: 'en' },
      ],
    },
    {
      key: 'package-managers',
      title: 'Package Managers (npm/pnpm)',
      description: 'Install, manage, and script dependencies for a modern JavaScript project.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'npm', url: 'https://docs.npmjs.com/', title: 'npm docs', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'react',
      title: 'React',
      description: 'Learn the most widely used UI library: components, props, state, and hooks.',
      group: 'Ecosystem',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'React', url: 'https://react.dev/learn', title: 'React official docs — Learn', durationMin: 90, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@codevolution', title: 'Codevolution React Course', durationMin: 180, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Udemy', url: 'https://www.udemy.com/topic/react/', title: 'React courses on Udemy', durationMin: 1500, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Frontend Mentor', url: 'https://www.frontendmentor.io/challenges?technologies=React', title: 'React challenges', durationMin: 300, lang: 'en' },
        { kind: 'ARTICLE', provider: 'HexletUniversity', url: 'https://www.youtube.com/@Hexlet', title: 'Hexlet — React на русском', durationMin: 120, lang: 'ru' },
      ],
    },
    {
      key: 'react-hooks',
      title: 'React Hooks',
      description: 'Manage state and side effects with useState, useEffect, useContext, and custom hooks.',
      group: 'Ecosystem',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'React', url: 'https://react.dev/reference/react', title: 'React Hooks reference', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'react-router',
      title: 'Routing with React Router',
      description: 'Build multi-page single-page applications with client-side routing.',
      group: 'Ecosystem',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'React Router', url: 'https://reactrouter.com/en/main', title: 'React Router documentation', durationMin: 40, lang: 'en' },
      ],
    },
    {
      key: 'state-management',
      title: 'State Management',
      description: 'Manage complex, shared application state beyond local component state.',
      group: 'Ecosystem',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Redux', url: 'https://redux.js.org/introduction/getting-started', title: 'Redux Toolkit — Getting Started', durationMin: 45, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Zustand', url: 'https://github.com/pmndrs/zustand', title: 'Zustand — a small state manager', durationMin: 20, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@codevolution', title: 'Redux Toolkit Tutorial', durationMin: 90, lang: 'en' },
      ],
    },
    {
      key: 'nextjs',
      title: 'Next.js',
      description: 'Learn the leading React framework: routing, server components, and data fetching.',
      group: 'Ecosystem',
      type: 'OPTIONAL',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Next.js', url: 'https://nextjs.org/learn', title: 'Next.js — Learn', durationMin: 120, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@vercel', title: 'Vercel channel', durationMin: 60, lang: 'en' },
      ],
    },
    {
      key: 'build-tools',
      title: 'Build Tools (Vite/Webpack)',
      description: 'Understand bundling, dev servers, and how modern JS tooling ships production code.',
      group: 'Ecosystem',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Vite', url: 'https://vitejs.dev/guide/', title: 'Vite Guide', durationMin: 30, lang: 'en' },
        { kind: 'ARTICLE', provider: 'web.dev', url: 'https://web.dev/learn/', title: 'web.dev learning paths', durationMin: 30, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TraversyMedia', title: 'Vite Crash Course', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'testing',
      title: 'Testing (Jest & Testing Library)',
      description: 'Write unit and component tests to catch regressions before users do.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Testing Library', url: 'https://testing-library.com/docs/', title: 'Testing Library docs', durationMin: 40, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'Jest', url: 'https://jestjs.io/docs/getting-started', title: 'Jest — Getting Started', durationMin: 30, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TraversyMedia', title: 'Jest Crash Course', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'web-perf',
      title: 'Web Performance & Accessibility',
      description: 'Optimize load times and Core Web Vitals, and make your app usable for everyone.',
      group: 'Job-ready',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'web.dev', url: 'https://web.dev/learn/accessibility/', title: 'Learn Accessibility', durationMin: 40, lang: 'en' },
        { kind: 'ARTICLE', provider: 'web.dev', url: 'https://web.dev/explore/learn-core-web-vitals', title: 'Core Web Vitals', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'deployment',
      title: 'Deployment & CI/CD',
      description: 'Ship your app to production with Vercel/Netlify and set up automatic deployments.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Vercel', url: 'https://vercel.com/docs', title: 'Vercel documentation', durationMin: 30, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'Netlify', url: 'https://docs.netlify.com/', title: 'Netlify documentation', durationMin: 30, lang: 'en' },
        { kind: 'ARTICLE', provider: 'GitHub', url: 'https://docs.github.com/en/actions', title: 'GitHub Actions documentation', durationMin: 40, lang: 'en' },
      ],
    },
    {
      key: 'portfolio',
      title: 'Portfolio & Job Prep',
      description: 'Assemble 3-4 polished projects, write case studies, and prepare for technical interviews.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'The Odin Project', url: 'https://www.theodinproject.com/paths/full-stack-javascript', title: 'The Odin Project — Full Stack path', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'LeetCode', url: 'https://leetcode.com/', title: 'LeetCode practice', durationMin: 600, lang: 'en' },
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/frontend', title: 'Frontend Developer Roadmap', durationMin: 20, lang: 'en' },
      ],
    },
  ],
  edges: [
    { from: 'internet-basics', to: 'html', kind: 'REQUIRED' },
    { from: 'html', to: 'html-forms', kind: 'REQUIRED' },
    { from: 'html', to: 'css', kind: 'REQUIRED' },
    { from: 'css', to: 'css-layout', kind: 'REQUIRED' },
    { from: 'css', to: 'css-preprocessors', kind: 'OPTIONAL' },
    { from: 'css', to: 'javascript', kind: 'REQUIRED' },
    { from: 'javascript', to: 'js-dom', kind: 'REQUIRED' },
    { from: 'javascript', to: 'js-async', kind: 'REQUIRED' },
    { from: 'javascript', to: 'ts', kind: 'REQUIRED' },
    { from: 'ts', to: 'git', kind: 'REQUIRED' },
    { from: 'git', to: 'package-managers', kind: 'REQUIRED' },
    { from: 'package-managers', to: 'react', kind: 'REQUIRED' },
    { from: 'react', to: 'react-hooks', kind: 'REQUIRED' },
    { from: 'react', to: 'react-router', kind: 'REQUIRED' },
    { from: 'react', to: 'state-management', kind: 'REQUIRED' },
    { from: 'state-management', to: 'nextjs', kind: 'OPTIONAL' },
    { from: 'state-management', to: 'build-tools', kind: 'REQUIRED' },
    { from: 'build-tools', to: 'testing', kind: 'REQUIRED' },
    { from: 'testing', to: 'web-perf', kind: 'REQUIRED' },
    { from: 'testing', to: 'deployment', kind: 'REQUIRED' },
    { from: 'deployment', to: 'portfolio', kind: 'REQUIRED' },
  ],
};

// ---------------------------------------------------------------------------
// Backend Developer
// ---------------------------------------------------------------------------

const backendDeveloper: RoadmapGraphTemplate = {
  slug: 'backend-developer',
  title: 'Backend Developer',
  description: {
    en: 'Become a job-ready backend developer with Node.js: APIs, databases, authentication, testing, and deployment.',
    ru: 'Станьте востребованным бэкенд-разработчиком на Node.js: API, базы данных, аутентификация, тестирование и деплой.',
    uz: 'Node.js boʻyicha backend dasturchi boʻling: API, maʻlumotlar bazasi, autentifikatsiya, test va deploy.',
  },
  difficulty: 'MEDIUM',
  estimatedWeeks: 18,
  tags: ['backend', 'node', 'api', 'database', 'server'],
  nodes: [
    {
      key: 'internet-basics-be',
      title: 'How the Internet & HTTP Work',
      description: 'Understand clients, servers, DNS, HTTP methods, status codes, and headers.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', title: 'HTTP — MDN', durationMin: 30, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'HTTP Crash Course', durationMin: 40, lang: 'en' },
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/backend', title: 'Backend Developer Roadmap', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'js-fundamentals-be',
      title: 'JavaScript Fundamentals',
      description: 'Learn core JavaScript: variables, functions, async/await, and modules — the language behind Node.js.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'POPULAR', provider: 'javascript.info', url: 'https://javascript.info/', title: 'The Modern JavaScript Tutorial', durationMin: 300, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'JavaScript Full Course', durationMin: 180, lang: 'en' },
        { kind: 'PRACTICE', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/', title: 'JS Algorithms and Data Structures', durationMin: 600, lang: 'en' },
        { kind: 'ARTICLE', provider: 'learn.javascript.ru', url: 'https://learn.javascript.ru/', title: 'Современный учебник JavaScript', durationMin: 300, lang: 'ru' },
      ],
    },
    {
      key: 'ts-be',
      title: 'TypeScript',
      description: 'Add static typing to your Node.js codebase for safer, more maintainable APIs.',
      group: 'Foundations',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'TypeScript', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', title: 'TypeScript Handbook', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Exercism', url: 'https://exercism.org/tracks/typescript', title: 'TypeScript track', durationMin: 300, lang: 'en' },
      ],
    },
    {
      key: 'git-be',
      title: 'Version Control (Git & GitHub)',
      description: 'Track changes and collaborate on backend codebases using Git and GitHub.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Git', url: 'https://git-scm.com/doc', title: 'Git documentation', durationMin: 30, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'Git and GitHub for Beginners', durationMin: 70, lang: 'en' },
        { kind: 'PRACTICE', provider: 'GitHub', url: 'https://skills.github.com/', title: 'GitHub Skills', durationMin: 120, lang: 'en' },
      ],
    },
    {
      key: 'nodejs',
      title: 'Node.js Runtime',
      description: 'Understand the event loop, modules, npm, and how to run JavaScript outside the browser.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Node.js', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', title: 'Node.js — Learn', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'Node.js Full Course', durationMin: 180, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Udemy', url: 'https://www.udemy.com/topic/nodejs/', title: 'Node.js courses on Udemy', durationMin: 1500, lang: 'en' },
        { kind: 'ARTICLE', provider: 'metanit.com', url: 'https://metanit.com/web/nodejs/', title: 'Node.js — учебник на русском', durationMin: 200, lang: 'ru' },
      ],
    },
    {
      key: 'npm',
      title: 'Package Managers (npm/pnpm)',
      description: 'Manage dependencies, scripts, and versioning for a Node.js project.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'npm', url: 'https://docs.npmjs.com/', title: 'npm docs', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'express',
      title: 'Express.js / Web Frameworks',
      description: 'Build HTTP servers and REST APIs using Express, the most widely used Node.js framework.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Express', url: 'https://expressjs.com/en/starter/installing.html', title: 'Express.js Getting Started', durationMin: 40, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TraversyMedia', title: 'Express Crash Course', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', title: 'Back End Development and APIs', durationMin: 400, lang: 'en' },
      ],
    },
    {
      key: 'nestjs',
      title: 'NestJS Framework',
      description: 'Learn a structured, opinionated Node.js framework for building scalable server-side apps.',
      group: 'Core',
      type: 'OPTIONAL',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'NestJS', url: 'https://docs.nestjs.com/', title: 'NestJS documentation', durationMin: 90, lang: 'en' },
      ],
    },
    {
      key: 'rest-api-design',
      title: 'REST API Design',
      description: 'Design clean, resource-oriented APIs: routing conventions, status codes, and versioning.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Glossary/REST', title: 'REST — MDN Glossary', durationMin: 15, lang: 'en' },
        { kind: 'ARTICLE', provider: 'restfulapi.net', url: 'https://restfulapi.net/', title: 'REST API Tutorial', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'sql',
      title: 'SQL & Relational Databases',
      description: 'Learn to model data and query it with SQL — the foundation of most production databases.',
      group: 'Databases',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'PostgreSQL', url: 'https://www.postgresql.org/docs/current/tutorial.html', title: 'PostgreSQL Tutorial', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'SQLZoo', url: 'https://sqlzoo.net/', title: 'SQLZoo interactive practice', durationMin: 180, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'SQL Full Course', durationMin: 240, lang: 'en' },
        { kind: 'ARTICLE', provider: 'metanit.com', url: 'https://metanit.com/sql/postgresql/', title: 'PostgreSQL — учебник на русском', durationMin: 200, lang: 'ru' },
      ],
    },
    {
      key: 'orm',
      title: 'ORMs (Prisma/TypeORM)',
      description: 'Interact with your database from code using type-safe query builders and migrations.',
      group: 'Databases',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Prisma', url: 'https://www.prisma.io/docs', title: 'Prisma documentation', durationMin: 60, lang: 'en' },
      ],
    },
    {
      key: 'nosql',
      title: 'NoSQL Databases (MongoDB)',
      description: 'Understand document databases and when to use them instead of relational storage.',
      group: 'Databases',
      type: 'OPTIONAL',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'MongoDB', url: 'https://www.mongodb.com/docs/manual/', title: 'MongoDB Manual', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'caching',
      title: 'Caching (Redis)',
      description: 'Use in-memory data stores to speed up reads and reduce database load.',
      group: 'Databases',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Redis', url: 'https://redis.io/docs/latest/', title: 'Redis documentation', durationMin: 40, lang: 'en' },
      ],
    },
    {
      key: 'auth',
      title: 'Authentication & Authorization',
      description: 'Implement secure login flows with sessions, JWTs, OAuth, and role-based access control.',
      group: 'Security',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'JWT.io', url: 'https://jwt.io/introduction', title: 'Introduction to JWT', durationMin: 20, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'Passport.js', url: 'https://www.passportjs.org/concepts/authentication/', title: 'Passport.js authentication concepts', durationMin: 30, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@webdevsimplified', title: 'Web Dev Simplified — Auth', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'security',
      title: 'API Security Basics',
      description: 'Defend against common vulnerabilities: injection, XSS, CSRF, and insecure secrets handling.',
      group: 'Security',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'OWASP', url: 'https://owasp.org/www-project-top-ten/', title: 'OWASP Top Ten', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'testing-be',
      title: 'Testing (Jest & Supertest)',
      description: 'Write unit and integration tests for your endpoints and business logic.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Jest', url: 'https://jestjs.io/docs/getting-started', title: 'Jest — Getting Started', durationMin: 30, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'Supertest', url: 'https://github.com/ladjs/supertest', title: 'Supertest — HTTP assertions', durationMin: 20, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TraversyMedia', title: 'Jest Crash Course', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'docker',
      title: 'Docker & Containers',
      description: 'Package your app and its dependencies into portable, reproducible containers.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Docker', url: 'https://docs.docker.com/get-started/', title: 'Docker Get Started', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TechWorldwithNana', title: 'Docker Tutorial for Beginners', durationMin: 120, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Docker', url: 'https://docs.docker.com/get-started/workshop/', title: 'Docker workshop', durationMin: 90, lang: 'en' },
      ],
    },
    {
      key: 'cicd',
      title: 'CI/CD Pipelines',
      description: 'Automate testing and deployment with GitHub Actions or similar tools.',
      group: 'Job-ready',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'GitHub', url: 'https://docs.github.com/en/actions', title: 'GitHub Actions documentation', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'deployment-be',
      title: 'Deployment & Hosting',
      description: 'Deploy a Node.js API to production using a cloud platform and manage environment config.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Render', url: 'https://render.com/docs', title: 'Render documentation', durationMin: 30, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'Railway', url: 'https://docs.railway.com/', title: 'Railway documentation', durationMin: 30, lang: 'en' },
        { kind: 'ARTICLE', provider: 'GitHub', url: 'https://docs.github.com/en/actions', title: 'GitHub Actions documentation', durationMin: 40, lang: 'en' },
      ],
    },
    {
      key: 'system-design',
      title: 'System Design Basics',
      description: 'Learn scaling, load balancing, message queues, and how to reason about tradeoffs.',
      group: 'Job-ready',
      type: 'OPTIONAL',
      resources: [
        { kind: 'ARTICLE', provider: 'GitHub', url: 'https://github.com/donnemartin/system-design-primer', title: 'System Design Primer', durationMin: 180, lang: 'en' },
      ],
    },
    {
      key: 'portfolio-be',
      title: 'Portfolio & Job Prep',
      description: 'Build 2-3 complete backend projects with docs and tests, and prepare for interviews.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'PRACTICE', provider: 'LeetCode', url: 'https://leetcode.com/', title: 'LeetCode practice', durationMin: 600, lang: 'en' },
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/backend', title: 'Backend Developer Roadmap', durationMin: 20, lang: 'en' },
        { kind: 'PRACTICE', provider: 'GitHub', url: 'https://github.com/topics/nodejs', title: 'Open-source Node.js projects', durationMin: 240, lang: 'en' },
      ],
    },
  ],
  edges: [
    { from: 'internet-basics-be', to: 'js-fundamentals-be', kind: 'REQUIRED' },
    { from: 'js-fundamentals-be', to: 'ts-be', kind: 'REQUIRED' },
    { from: 'ts-be', to: 'git-be', kind: 'REQUIRED' },
    { from: 'git-be', to: 'nodejs', kind: 'REQUIRED' },
    { from: 'nodejs', to: 'npm', kind: 'REQUIRED' },
    { from: 'nodejs', to: 'express', kind: 'REQUIRED' },
    { from: 'express', to: 'nestjs', kind: 'OPTIONAL' },
    { from: 'express', to: 'rest-api-design', kind: 'REQUIRED' },
    { from: 'rest-api-design', to: 'sql', kind: 'REQUIRED' },
    { from: 'sql', to: 'orm', kind: 'REQUIRED' },
    { from: 'sql', to: 'nosql', kind: 'OPTIONAL' },
    { from: 'sql', to: 'caching', kind: 'REQUIRED' },
    { from: 'caching', to: 'auth', kind: 'REQUIRED' },
    { from: 'auth', to: 'security', kind: 'REQUIRED' },
    { from: 'security', to: 'testing-be', kind: 'REQUIRED' },
    { from: 'testing-be', to: 'docker', kind: 'REQUIRED' },
    { from: 'docker', to: 'cicd', kind: 'REQUIRED' },
    { from: 'docker', to: 'deployment-be', kind: 'REQUIRED' },
    { from: 'deployment-be', to: 'system-design', kind: 'OPTIONAL' },
    { from: 'deployment-be', to: 'portfolio-be', kind: 'REQUIRED' },
  ],
};

// ---------------------------------------------------------------------------
// Data Analyst
// ---------------------------------------------------------------------------

const dataAnalyst: RoadmapGraphTemplate = {
  slug: 'data-analyst',
  title: 'Data Analyst',
  description: {
    en: 'Learn to collect, clean, analyze, and visualize data to drive business decisions.',
    ru: 'Научитесь собирать, очищать, анализировать и визуализировать данные для принятия бизнес-решений.',
    uz: 'Biznes qarorlarini qabul qilish uchun maʻlumotlarni yigʻish, tozalash, tahlil qilish va vizualizatsiya qilishni oʻrganing.',
  },
  difficulty: 'EASY',
  estimatedWeeks: 12,
  tags: ['data', 'analyst', 'sql', 'python', 'excel', 'analytics'],
  nodes: [
    {
      key: 'spreadsheets',
      title: 'Spreadsheets (Excel/Sheets)',
      description: 'Master formulas, pivot tables, and charts — the most common analyst tool on day one.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'Excel Full Course', durationMin: 180, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'Microsoft', url: 'https://support.microsoft.com/en-us/excel', title: 'Excel support & training', durationMin: 40, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Coursera', url: 'https://www.coursera.org/specializations/excel', title: 'Excel Skills for Business (Coursera)', durationMin: 1200, lang: 'en' },
      ],
    },
    {
      key: 'stats-basics',
      title: 'Statistics Fundamentals',
      description: 'Learn descriptive statistics, distributions, and hypothesis testing for data-driven reasoning.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'PAID_COURSE', provider: 'Khan Academy', url: 'https://www.khanacademy.org/math/statistics-probability', title: 'Statistics and Probability', durationMin: 600, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@statquest', title: 'StatQuest with Josh Starmer', durationMin: 120, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/intro-to-statistics', title: 'Kaggle Learn: Intro to Statistics', durationMin: 120, lang: 'en' },
      ],
    },
    {
      key: 'sql-da',
      title: 'SQL for Analysis',
      description: 'Query, join, and aggregate data from relational databases to answer business questions.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'PRACTICE', provider: 'SQLZoo', url: 'https://sqlzoo.net/', title: 'SQLZoo interactive practice', durationMin: 180, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'PostgreSQL', url: 'https://www.postgresql.org/docs/current/tutorial.html', title: 'PostgreSQL Tutorial', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'SQL Full Course', durationMin: 240, lang: 'en' },
        { kind: 'ARTICLE', provider: 'metanit.com', url: 'https://metanit.com/sql/postgresql/', title: 'PostgreSQL — учебник на русском', durationMin: 200, lang: 'ru' },
      ],
    },
    {
      key: 'sql-advanced',
      title: 'Window Functions & CTEs',
      description: 'Go beyond basic queries with window functions, CTEs, and query optimization.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'PostgreSQL', url: 'https://www.postgresql.org/docs/current/tutorial-window.html', title: 'Window Functions Tutorial', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'python-da',
      title: 'Python Fundamentals',
      description: 'Learn Python syntax and basics as the scripting language for data analysis.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Python', url: 'https://docs.python.org/3/tutorial/', title: 'The Python Tutorial', durationMin: 90, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'Python for Beginners', durationMin: 240, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/python', title: 'Kaggle Learn: Python', durationMin: 300, lang: 'en' },
      ],
    },
    {
      key: 'pandas',
      title: 'Pandas & NumPy',
      description: 'Load, clean, transform, and analyze tabular data efficiently in Python.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'pandas', url: 'https://pandas.pydata.org/docs/getting_started/index.html', title: 'pandas — Getting started', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/pandas', title: 'Kaggle Learn: Pandas', durationMin: 240, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@KeithGalli', title: 'Keith Galli — Pandas tutorial', durationMin: 60, lang: 'en' },
      ],
    },
    {
      key: 'data-cleaning',
      title: 'Data Cleaning',
      description: 'Handle missing values, duplicates, and inconsistent formats before analysis.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/data-cleaning', title: 'Kaggle Learn: Data Cleaning', durationMin: 180, lang: 'en' },
      ],
    },
    {
      key: 'excel-advanced',
      title: 'Advanced Excel (Power Query)',
      description: 'Automate repetitive data prep tasks directly inside Excel using Power Query.',
      group: 'Core',
      type: 'OPTIONAL',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Microsoft', url: 'https://learn.microsoft.com/en-us/power-query/', title: 'Power Query documentation', durationMin: 40, lang: 'en' },
      ],
    },
    {
      key: 'dataviz',
      title: 'Data Visualization',
      description: 'Communicate insights clearly with charts using Matplotlib, Seaborn, or Tableau.',
      group: 'Visualization',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Matplotlib', url: 'https://matplotlib.org/stable/tutorials/index.html', title: 'Matplotlib tutorials', durationMin: 45, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/data-visualization', title: 'Kaggle Learn: Data Visualization', durationMin: 180, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@coreyms', title: 'Corey Schafer — Matplotlib tutorials', durationMin: 90, lang: 'en' },
      ],
    },
    {
      key: 'bi-tools',
      title: 'BI Tools (Tableau/Power BI)',
      description: 'Build interactive dashboards used by stakeholders and executives.',
      group: 'Visualization',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Tableau', url: 'https://www.tableau.com/learn/training', title: 'Tableau training resources', durationMin: 60, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'Microsoft', url: 'https://learn.microsoft.com/en-us/power-bi/', title: 'Power BI documentation', durationMin: 60, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Coursera', url: 'https://www.coursera.org/specializations/data-visualization', title: 'Data Visualization Specialization', durationMin: 1200, lang: 'en' },
      ],
    },
    {
      key: 'ab-testing',
      title: 'A/B Testing & Experimentation',
      description: 'Design and interpret experiments to measure the impact of product changes.',
      group: 'Visualization',
      type: 'OPTIONAL',
      resources: [
        { kind: 'ARTICLE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/intro-to-ab-testing', title: 'Kaggle Learn: Intro to A/B Testing', durationMin: 120, lang: 'en' },
      ],
    },
    {
      key: 'storytelling',
      title: 'Data Storytelling',
      description: 'Turn analysis into a clear narrative and recommendation for non-technical stakeholders.',
      group: 'Job-ready',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/data-analyst', title: 'Data Analyst Roadmap', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'portfolio-da',
      title: 'Portfolio & Job Prep',
      description: 'Build 3-4 end-to-end analysis projects with real datasets and publish them.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/datasets', title: 'Kaggle datasets', durationMin: 300, lang: 'en' },
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/data-analyst', title: 'Data Analyst Roadmap', durationMin: 20, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/google-data-analytics', title: 'Google Data Analytics Certificate', durationMin: 1800, lang: 'en' },
      ],
    },
  ],
  edges: [
    { from: 'spreadsheets', to: 'stats-basics', kind: 'REQUIRED' },
    { from: 'stats-basics', to: 'sql-da', kind: 'REQUIRED' },
    { from: 'sql-da', to: 'sql-advanced', kind: 'REQUIRED' },
    { from: 'sql-da', to: 'python-da', kind: 'REQUIRED' },
    { from: 'python-da', to: 'pandas', kind: 'REQUIRED' },
    { from: 'pandas', to: 'data-cleaning', kind: 'REQUIRED' },
    { from: 'pandas', to: 'excel-advanced', kind: 'OPTIONAL' },
    { from: 'pandas', to: 'dataviz', kind: 'REQUIRED' },
    { from: 'dataviz', to: 'bi-tools', kind: 'REQUIRED' },
    { from: 'bi-tools', to: 'ab-testing', kind: 'OPTIONAL' },
    { from: 'bi-tools', to: 'storytelling', kind: 'REQUIRED' },
    { from: 'storytelling', to: 'portfolio-da', kind: 'REQUIRED' },
  ],
};

// ---------------------------------------------------------------------------
// AI Engineer
// ---------------------------------------------------------------------------

const aiEngineer: RoadmapGraphTemplate = {
  slug: 'ai-engineer',
  title: 'AI Engineer',
  description: {
    en: 'Learn the skills to build and ship AI-powered products: Python, math foundations, ML, deep learning, and LLMs.',
    ru: 'Изучите навыки создания продуктов на базе ИИ: Python, основы математики, машинное обучение, глубокое обучение и LLM.',
    uz: 'AI asosidagi mahsulotlarni yaratish koʻnikmalarini oʻrganing: Python, matematik asoslar, ML, deep learning va LLM.',
  },
  difficulty: 'HARD',
  estimatedWeeks: 20,
  tags: ['ai', 'ml', 'machine learning', 'llm', 'python', 'deep learning'],
  nodes: [
    {
      key: 'python-ai',
      title: 'Python Fundamentals',
      description: 'Learn Python syntax, data structures, and scripting — the primary language of AI/ML.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Python', url: 'https://docs.python.org/3/tutorial/', title: 'The Python Tutorial', durationMin: 90, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'Python for Beginners', durationMin: 240, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/python', title: 'Kaggle Learn: Python', durationMin: 300, lang: 'en' },
      ],
    },
    {
      key: 'math-foundations',
      title: 'Math Foundations (Linear Algebra & Calculus)',
      description: 'Build intuition for vectors, matrices, derivatives, and gradients used throughout ML.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@3blue1brown', title: '3Blue1Brown — Essence of Linear Algebra', durationMin: 180, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Khan Academy', url: 'https://www.khanacademy.org/math/linear-algebra', title: 'Khan Academy — Linear Algebra', durationMin: 600, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Khan Academy', url: 'https://www.khanacademy.org/math/calculus-1', title: 'Khan Academy — Calculus 1', durationMin: 600, lang: 'en' },
      ],
    },
    {
      key: 'stats-ai',
      title: 'Probability & Statistics',
      description: 'Understand distributions, expectation, and variance that underpin ML algorithms.',
      group: 'Foundations',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@statquest', title: 'StatQuest with Josh Starmer', durationMin: 120, lang: 'en' },
      ],
    },
    {
      key: 'numpy-pandas',
      title: 'NumPy & Pandas',
      description: 'Manipulate numerical data and datasets efficiently before feeding them into models.',
      group: 'Foundations',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'NumPy', url: 'https://numpy.org/doc/stable/user/quickstart.html', title: 'NumPy quickstart', durationMin: 40, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/pandas', title: 'Kaggle Learn: Pandas', durationMin: 240, lang: 'en' },
      ],
    },
    {
      key: 'ml-basics',
      title: 'Machine Learning Basics',
      description: 'Learn supervised/unsupervised learning, regression, classification, and evaluation metrics.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', title: 'Kaggle Learn: Intro to Machine Learning', durationMin: 180, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Coursera', url: 'https://www.coursera.org/specializations/machine-learning-introduction', title: 'Machine Learning Specialization (Andrew Ng)', durationMin: 2400, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@statquest', title: 'StatQuest — ML playlist', durationMin: 150, lang: 'en' },
      ],
    },
    {
      key: 'scikit-learn',
      title: 'Scikit-learn',
      description: 'Train and evaluate classic ML models with the standard Python ML library.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'scikit-learn', url: 'https://scikit-learn.org/stable/user_guide.html', title: 'scikit-learn User Guide', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/intermediate-machine-learning', title: 'Kaggle Learn: Intermediate ML', durationMin: 240, lang: 'en' },
      ],
    },
    {
      key: 'feature-engineering',
      title: 'Feature Engineering',
      description: 'Transform raw data into signals that improve model performance.',
      group: 'Core',
      type: 'OPTIONAL',
      resources: [
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/feature-engineering', title: 'Kaggle Learn: Feature Engineering', durationMin: 180, lang: 'en' },
      ],
    },
    {
      key: 'deep-learning',
      title: 'Deep Learning',
      description: 'Learn neural networks, backpropagation, and how to train models with PyTorch or TensorFlow.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'PyTorch', url: 'https://pytorch.org/tutorials/', title: 'PyTorch tutorials', durationMin: 120, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Coursera', url: 'https://www.coursera.org/specializations/deep-learning', title: 'Deep Learning Specialization (Andrew Ng)', durationMin: 2400, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@3blue1brown', title: '3Blue1Brown — Neural Networks', durationMin: 90, lang: 'en' },
      ],
    },
    {
      key: 'nn-architectures',
      title: 'CNNs & RNNs',
      description: 'Understand convolutional and recurrent architectures for images, sequences, and time series.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'PyTorch', url: 'https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html', title: 'Training a classifier (CNN tutorial)', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'llms',
      title: 'LLMs & Prompt Engineering',
      description: 'Understand transformer-based language models and how to prompt, evaluate, and guide them.',
      group: 'LLMs',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Anthropic', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', title: 'Anthropic — Prompt engineering overview', durationMin: 60, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'OpenAI', url: 'https://platform.openai.com/docs/guides/prompt-engineering', title: 'OpenAI prompt engineering guide', durationMin: 45, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@AndrejKarpathy', title: 'Andrej Karpathy — LLM lectures', durationMin: 180, lang: 'en' },
        { kind: 'PRACTICE', provider: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/short-courses/', title: 'DeepLearning.AI short courses', durationMin: 300, lang: 'en' },
      ],
    },
    {
      key: 'rag',
      title: 'RAG & Vector Databases',
      description: 'Ground LLM responses in your own data using retrieval-augmented generation and embeddings.',
      group: 'LLMs',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Anthropic', url: 'https://docs.anthropic.com/en/docs/build-with-claude/embeddings', title: 'Anthropic — Embeddings', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'agents-tools',
      title: 'AI Agents & Tool Use',
      description: 'Build agentic systems where an LLM calls tools/functions to accomplish multi-step tasks.',
      group: 'LLMs',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Anthropic', url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview', title: 'Anthropic — Tool use overview', durationMin: 40, lang: 'en' },
      ],
    },
    {
      key: 'mlops',
      title: 'MLOps & Model Deployment',
      description: 'Package, version, deploy, and monitor ML models in production.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Google Cloud', url: 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', title: 'MLOps: Continuous delivery and automation pipelines', durationMin: 45, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'Docker', url: 'https://docs.docker.com/get-started/', title: 'Docker Get Started', durationMin: 60, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Coursera', url: 'https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops', title: 'Machine Learning Engineering for Production (MLOps)', durationMin: 1800, lang: 'en' },
      ],
    },
    {
      key: 'portfolio-ai',
      title: 'Portfolio & Job Prep',
      description: 'Ship 2-3 AI projects (an ML model and an LLM app) with clear write-ups and demos.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'PRACTICE', provider: 'Kaggle', url: 'https://www.kaggle.com/competitions', title: 'Kaggle competitions', durationMin: 600, lang: 'en' },
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/ai-engineer', title: 'AI Engineer Roadmap', durationMin: 20, lang: 'en' },
        { kind: 'PRACTICE', provider: 'GitHub', url: 'https://github.com/topics/machine-learning', title: 'Open-source ML/AI projects', durationMin: 300, lang: 'en' },
      ],
    },
  ],
  edges: [
    { from: 'python-ai', to: 'math-foundations', kind: 'REQUIRED' },
    { from: 'math-foundations', to: 'stats-ai', kind: 'REQUIRED' },
    { from: 'math-foundations', to: 'numpy-pandas', kind: 'REQUIRED' },
    { from: 'numpy-pandas', to: 'ml-basics', kind: 'REQUIRED' },
    { from: 'ml-basics', to: 'scikit-learn', kind: 'REQUIRED' },
    { from: 'ml-basics', to: 'feature-engineering', kind: 'OPTIONAL' },
    { from: 'ml-basics', to: 'deep-learning', kind: 'REQUIRED' },
    { from: 'deep-learning', to: 'nn-architectures', kind: 'REQUIRED' },
    { from: 'deep-learning', to: 'llms', kind: 'REQUIRED' },
    { from: 'llms', to: 'rag', kind: 'REQUIRED' },
    { from: 'llms', to: 'agents-tools', kind: 'REQUIRED' },
    { from: 'agents-tools', to: 'mlops', kind: 'REQUIRED' },
    { from: 'mlops', to: 'portfolio-ai', kind: 'REQUIRED' },
  ],
};

// ---------------------------------------------------------------------------
// UI/UX Designer
// ---------------------------------------------------------------------------

const uiUxDesigner: RoadmapGraphTemplate = {
  slug: 'ui-ux-designer',
  title: 'UI/UX Designer',
  description: {
    en: 'Learn design principles, research methods, and tools to design usable, beautiful digital products.',
    ru: 'Изучите принципы дизайна, методы исследования и инструменты для создания удобных и красивых цифровых продуктов.',
    uz: 'Foydali va chiroyli raqamli mahsulotlarni loyihalash uchun dizayn tamoyillari, tadqiqot usullari va vositalarni oʻrganing.',
  },
  difficulty: 'EASY',
  estimatedWeeks: 12,
  tags: ['design', 'ux', 'ui', 'figma', 'product design'],
  nodes: [
    {
      key: 'design-principles',
      title: 'Design Principles',
      description: 'Learn color theory, typography, layout, and visual hierarchy fundamentals.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@CharliMarieTV', title: 'CharliMarieTV — design channel', durationMin: 60, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Interaction Design Foundation', url: 'https://www.interaction-design.org/literature/topics/visual-design', title: 'Visual Design — IxDF', durationMin: 30, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Coursera', url: 'https://www.coursera.org/professional-certificates/google-ux-design', title: 'Google UX Design Certificate', durationMin: 1800, lang: 'en' },
      ],
    },
    {
      key: 'color-typography',
      title: 'Color & Typography',
      description: 'Choose accessible color palettes and typographic systems that scale across a product.',
      group: 'Foundations',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'web.dev', url: 'https://web.dev/learn/accessibility/color-contrast', title: 'Color and contrast accessibility', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'ux-fundamentals',
      title: 'UX Fundamentals',
      description: 'Understand usability heuristics, user-centered design, and the design process.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/', title: 'Ten Usability Heuristics', durationMin: 20, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@AJ%26Smart', title: 'AJ&Smart channel', durationMin: 45, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Interaction Design Foundation', url: 'https://www.interaction-design.org/literature/topics/ux-design', title: 'What is UX Design?', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'ux-research',
      title: 'UX Research',
      description: 'Conduct user interviews, surveys, and usability testing to validate design decisions.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/which-ux-research-methods/', title: 'Which UX Research Methods?', durationMin: 25, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Coursera', url: 'https://www.coursera.org/learn/user-research', title: 'UX Research at Scale (Coursera)', durationMin: 600, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@CharliMarieTV', title: 'UX Research basics', durationMin: 40, lang: 'en' },
      ],
    },
    {
      key: 'personas-journeys',
      title: 'Personas & User Journeys',
      description: 'Synthesize research into personas and journey maps that guide design decisions.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Interaction Design Foundation', url: 'https://www.interaction-design.org/literature/topics/personas', title: 'Personas — IxDF', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'wireframing',
      title: 'Wireframing & Prototyping',
      description: 'Sketch low- and high-fidelity wireframes and build interactive prototypes.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@DesignCourse', title: 'DesignCourse channel', durationMin: 60, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Figma', url: 'https://www.figma.com/resource-library/what-is-wireframing/', title: 'What is wireframing?', durationMin: 15, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Figma', url: 'https://www.figma.com/prototyping/', title: 'Prototype in Figma', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'figma',
      title: 'Figma',
      description: 'Learn the industry-standard design tool: frames, components, auto layout, and prototyping.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Figma', url: 'https://help.figma.com/hc/en-us/categories/360002051613-Figma-Design', title: 'Figma Design help center', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@Figma', title: 'Figma official channel', durationMin: 90, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Figma', url: 'https://www.figma.com/community', title: 'Figma Community files', durationMin: 180, lang: 'en' },
      ],
    },
    {
      key: 'design-systems',
      title: 'Design Systems',
      description: 'Build reusable component libraries and style guides for consistent product design.',
      group: 'Core',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Figma', url: 'https://www.figma.com/resource-library/design-systems-101/', title: 'Design Systems 101', durationMin: 25, lang: 'en' },
      ],
    },
    {
      key: 'interaction-design',
      title: 'Interaction & Motion Design',
      description: 'Add micro-interactions and motion that make interfaces feel responsive and alive.',
      group: 'Core',
      type: 'OPTIONAL',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@DesignCourse', title: 'Micro-interactions in Figma', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'accessibility-design',
      title: 'Accessibility (a11y)',
      description: 'Design inclusive interfaces that work for people with diverse abilities.',
      group: 'Job-ready',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'W3C', url: 'https://www.w3.org/WAI/fundamentals/accessibility-principles/', title: 'Accessibility Principles — W3C', durationMin: 25, lang: 'en' },
      ],
    },
    {
      key: 'design-handoff',
      title: 'Developer Handoff',
      description: 'Prepare specs, redlines, and assets so engineers can implement your designs accurately.',
      group: 'Job-ready',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Figma', url: 'https://www.figma.com/dev-mode/', title: 'Figma Dev Mode', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'portfolio-design',
      title: 'Portfolio & Case Studies',
      description: 'Publish 3-4 polished case studies that show your process, not just final screens.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/ux-design', title: 'UX Design Roadmap', durationMin: 20, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Figma', url: 'https://www.figma.com/community', title: 'Figma Community — inspiration', durationMin: 120, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Bestfolios', url: 'https://www.bestfolios.com/casestudy', title: 'UX case study examples', durationMin: 30, lang: 'en' },
      ],
    },
  ],
  edges: [
    { from: 'design-principles', to: 'color-typography', kind: 'REQUIRED' },
    { from: 'design-principles', to: 'ux-fundamentals', kind: 'REQUIRED' },
    { from: 'ux-fundamentals', to: 'ux-research', kind: 'REQUIRED' },
    { from: 'ux-research', to: 'personas-journeys', kind: 'REQUIRED' },
    { from: 'ux-research', to: 'wireframing', kind: 'REQUIRED' },
    { from: 'wireframing', to: 'figma', kind: 'REQUIRED' },
    { from: 'figma', to: 'design-systems', kind: 'REQUIRED' },
    { from: 'figma', to: 'interaction-design', kind: 'OPTIONAL' },
    { from: 'design-systems', to: 'accessibility-design', kind: 'REQUIRED' },
    { from: 'design-systems', to: 'design-handoff', kind: 'REQUIRED' },
    { from: 'design-handoff', to: 'portfolio-design', kind: 'REQUIRED' },
  ],
};

// ---------------------------------------------------------------------------
// QA Engineer
// ---------------------------------------------------------------------------

const qaEngineer: RoadmapGraphTemplate = {
  slug: 'qa-engineer',
  title: 'QA Engineer',
  description: {
    en: 'Learn manual and automated testing to become a job-ready quality assurance engineer.',
    ru: 'Изучите ручное и автоматизированное тестирование, чтобы стать востребованным инженером по контролю качества.',
    uz: 'Ish uchun tayyor sifat nazorati muhandisi boʻlish uchun qoʻlda va avtomatlashtirilgan testlashni oʻrganing.',
  },
  difficulty: 'EASY',
  estimatedWeeks: 10,
  tags: ['qa', 'testing', 'test automation', 'quality assurance'],
  nodes: [
    {
      key: 'testing-theory',
      title: 'Software Testing Theory',
      description: 'Learn the fundamentals: test levels, test types, SDLC, and the role of QA in a team.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'ISTQB', url: 'https://www.istqb.org/certifications/certified-tester-foundation-level', title: 'ISTQB Foundation Level syllabus', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TestingMindset', title: 'Testing Mindset channel', durationMin: 45, lang: 'en' },
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/qa', title: 'QA Roadmap', durationMin: 20, lang: 'en' },
      ],
    },
    {
      key: 'sdlc',
      title: 'SDLC & Agile',
      description: 'Understand how testing fits into Agile/Scrum development cycles.',
      group: 'Foundations',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Atlassian', url: 'https://www.atlassian.com/agile', title: 'Agile Coach — Atlassian', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'test-design',
      title: 'Test Case Design Techniques',
      description: 'Write effective test cases using boundary value analysis, equivalence partitioning, and more.',
      group: 'Foundations',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Ministry of Testing', url: 'https://www.ministryoftesting.com/dojo', title: 'Ministry of Testing — Dojo', durationMin: 45, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TestAutomationUniversity', title: 'Test Automation University', durationMin: 60, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Guru99', url: 'https://www.guru99.com/test-case-design-technique.html', title: 'Test case design techniques', durationMin: 25, lang: 'en' },
      ],
    },
    {
      key: 'bug-reporting',
      title: 'Bug Reporting & Tracking',
      description: 'Write clear, reproducible bug reports and manage them through tools like Jira.',
      group: 'Foundations',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Atlassian', url: 'https://www.atlassian.com/software/jira/guides', title: 'Jira guides — Atlassian', durationMin: 30, lang: 'en' },
      ],
    },
    {
      key: 'sql-qa',
      title: 'SQL for Testers',
      description: 'Query databases directly to verify data integrity during testing.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'PRACTICE', provider: 'SQLZoo', url: 'https://sqlzoo.net/', title: 'SQLZoo interactive practice', durationMin: 180, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'PostgreSQL', url: 'https://www.postgresql.org/docs/current/tutorial.html', title: 'PostgreSQL Tutorial', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'SQL Full Course for Beginners', durationMin: 240, lang: 'en' },
      ],
    },
    {
      key: 'api-testing',
      title: 'API Testing',
      description: 'Test REST APIs using Postman: requests, assertions, environments, and collections.',
      group: 'Core',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Postman', url: 'https://learning.postman.com/docs/getting-started/introduction/', title: 'Postman learning center', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TestAutomationUniversity', title: 'API Testing with Postman', durationMin: 60, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Postman', url: 'https://www.postman.com/api-platform/api-testing/', title: 'Postman API testing practice', durationMin: 120, lang: 'en' },
      ],
    },
    {
      key: 'linux-basics-qa',
      title: 'Linux & Command Line Basics',
      description: 'Get comfortable navigating the terminal — essential for running test tooling and CI.',
      group: 'Core',
      type: 'OPTIONAL',
      resources: [
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'Linux Command Line Basics', durationMin: 90, lang: 'en' },
      ],
    },
    {
      key: 'js-for-automation',
      title: 'Programming Basics (JS/TS)',
      description: 'Learn enough JavaScript/TypeScript to write and understand test automation scripts.',
      group: 'Automation',
      type: 'TOPIC',
      resources: [
        { kind: 'POPULAR', provider: 'javascript.info', url: 'https://javascript.info/', title: 'The Modern JavaScript Tutorial', durationMin: 300, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@freecodecamp', title: 'JavaScript Full Course', durationMin: 180, lang: 'en' },
        { kind: 'OFFICIAL_DOC', provider: 'MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', title: 'MDN JavaScript Guide', durationMin: 120, lang: 'en' },
      ],
    },
    {
      key: 'playwright',
      title: 'Test Automation with Playwright',
      description: 'Write reliable end-to-end browser tests with Playwright, the modern automation framework.',
      group: 'Automation',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'Playwright', url: 'https://playwright.dev/docs/intro', title: 'Playwright — Getting Started', durationMin: 60, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TestAutomationUniversity', title: 'Playwright automation tutorials', durationMin: 90, lang: 'en' },
        { kind: 'PAID_COURSE', provider: 'Udemy', url: 'https://www.udemy.com/topic/playwright/', title: 'Playwright courses on Udemy', durationMin: 900, lang: 'en' },
        { kind: 'PRACTICE', provider: 'Playwright', url: 'https://playwright.dev/docs/writing-tests', title: 'Writing Playwright tests', durationMin: 120, lang: 'en' },
      ],
    },
    {
      key: 'page-object-model',
      title: 'Page Object Model & Best Practices',
      description: 'Structure automation suites for maintainability using the Page Object pattern.',
      group: 'Automation',
      type: 'SUBTOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'Playwright', url: 'https://playwright.dev/docs/pom', title: 'Playwright — Page Object Models', durationMin: 25, lang: 'en' },
      ],
    },
    {
      key: 'ci-for-qa',
      title: 'CI Integration for Tests',
      description: 'Run automated test suites on every commit using GitHub Actions or similar CI tools.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'GitHub', url: 'https://docs.github.com/en/actions', title: 'GitHub Actions documentation', durationMin: 45, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Playwright', url: 'https://playwright.dev/docs/ci', title: 'Playwright — Continuous Integration', durationMin: 20, lang: 'en' },
        { kind: 'FREE_VIDEO', provider: 'YouTube', url: 'https://www.youtube.com/@TechWorldwithNana', title: 'GitHub Actions CI/CD Tutorial', durationMin: 60, lang: 'en' },
      ],
    },
    {
      key: 'performance-security-testing',
      title: 'Performance & Security Testing Basics',
      description: 'Get an introduction to load testing and common security testing concepts.',
      group: 'Job-ready',
      type: 'OPTIONAL',
      resources: [
        { kind: 'OFFICIAL_DOC', provider: 'OWASP', url: 'https://owasp.org/www-project-top-ten/', title: 'OWASP Top Ten', durationMin: 45, lang: 'en' },
      ],
    },
    {
      key: 'portfolio-qa',
      title: 'Portfolio & Job Prep',
      description: 'Build a public automation project with a CI pipeline and prepare for QA interviews.',
      group: 'Job-ready',
      type: 'TOPIC',
      resources: [
        { kind: 'ARTICLE', provider: 'roadmap.sh', url: 'https://roadmap.sh/qa', title: 'QA Roadmap', durationMin: 20, lang: 'en' },
        { kind: 'PRACTICE', provider: 'GitHub', url: 'https://github.com/topics/testing', title: 'Open-source testing projects', durationMin: 180, lang: 'en' },
        { kind: 'ARTICLE', provider: 'Ministry Testing', url: 'https://www.ministryoftesting.com/articles', title: 'QA interview prep articles', durationMin: 40, lang: 'en' },
      ],
    },
  ],
  edges: [
    { from: 'testing-theory', to: 'sdlc', kind: 'REQUIRED' },
    { from: 'testing-theory', to: 'test-design', kind: 'REQUIRED' },
    { from: 'test-design', to: 'bug-reporting', kind: 'REQUIRED' },
    { from: 'test-design', to: 'sql-qa', kind: 'REQUIRED' },
    { from: 'sql-qa', to: 'api-testing', kind: 'REQUIRED' },
    { from: 'api-testing', to: 'linux-basics-qa', kind: 'OPTIONAL' },
    { from: 'api-testing', to: 'js-for-automation', kind: 'REQUIRED' },
    { from: 'js-for-automation', to: 'playwright', kind: 'REQUIRED' },
    { from: 'playwright', to: 'page-object-model', kind: 'REQUIRED' },
    { from: 'playwright', to: 'ci-for-qa', kind: 'REQUIRED' },
    { from: 'ci-for-qa', to: 'performance-security-testing', kind: 'OPTIONAL' },
    { from: 'ci-for-qa', to: 'portfolio-qa', kind: 'REQUIRED' },
  ],
};

export const GRAPH_TEMPLATES: RoadmapGraphTemplate[] = [
  frontendDeveloper,
  backendDeveloper,
  dataAnalyst,
  aiEngineer,
  uiUxDesigner,
  qaEngineer,
];

const ROLE_ALIASES: Record<string, string> = {
  // Frontend
  frontend: 'frontend-developer',
  'frontend developer': 'frontend-developer',
  'front-end': 'frontend-developer',
  'front-end developer': 'frontend-developer',
  'react developer': 'frontend-developer',
  'веб-разработчик': 'frontend-developer',
  'фронтенд': 'frontend-developer',
  'фронтенд разработчик': 'frontend-developer',
  'фронтендер': 'frontend-developer',
  'frontend dasturchi': 'frontend-developer',
  'frontend dasturchisi': 'frontend-developer',
  // Backend
  backend: 'backend-developer',
  'backend developer': 'backend-developer',
  'back-end': 'backend-developer',
  'back-end developer': 'backend-developer',
  'node.js developer': 'backend-developer',
  'nodejs developer': 'backend-developer',
  'бэкенд': 'backend-developer',
  'бекенд': 'backend-developer',
  'бэкенд разработчик': 'backend-developer',
  'backend dasturchi': 'backend-developer',
  fullstack: 'backend-developer',
  'full-stack': 'backend-developer',
  'full stack developer': 'backend-developer',
  'фулстек': 'backend-developer',
  // Data
  'data analyst': 'data-analyst',
  'analyst': 'data-analyst',
  'аналитик данных': 'data-analyst',
  'дата аналитик': 'data-analyst',
  'data dasturchi': 'data-analyst',
  'maʻlumotlar tahlilchisi': 'data-analyst',
  // AI
  'data scientist': 'ai-engineer',
  'ml engineer': 'ai-engineer',
  'machine learning engineer': 'ai-engineer',
  'ai engineer': 'ai-engineer',
  'ии инженер': 'ai-engineer',
  'инженер машинного обучения': 'ai-engineer',
  'ml muhandisi': 'ai-engineer',
  // Design
  designer: 'ui-ux-designer',
  'ux designer': 'ui-ux-designer',
  'ui designer': 'ui-ux-designer',
  'product designer': 'ui-ux-designer',
  'дизайнер': 'ui-ux-designer',
  'ux/ui дизайнер': 'ui-ux-designer',
  'dizayner': 'ui-ux-designer',
  // QA
  tester: 'qa-engineer',
  'qa engineer': 'qa-engineer',
  'test engineer': 'qa-engineer',
  'тестировщик': 'qa-engineer',
  'qa инженер': 'qa-engineer',
  'test dasturchi': 'qa-engineer',
};

export function findGraphTemplate(targetRole: string): RoadmapGraphTemplate | undefined {
  const q = targetRole.trim().toLowerCase();
  const direct = GRAPH_TEMPLATES.find(
    (t) => t.slug === q || t.title.toLowerCase() === q,
  );
  if (direct) return direct;
  const alias = ROLE_ALIASES[q];
  if (alias) return GRAPH_TEMPLATES.find((t) => t.slug === alias);
  return GRAPH_TEMPLATES.find(
    (t) =>
      t.tags.some((tag) => q.includes(tag)) ||
      q.includes(t.slug.split('-')[0]) ||
      t.title.toLowerCase().split(' ').some((w) => w.length > 3 && q.includes(w)),
  );
}
