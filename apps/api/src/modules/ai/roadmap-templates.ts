import { AiRoadmap, ExperienceLevel, ResourceType } from '@careeros/shared';

type Tmpl = AiRoadmap & { keywords: string[] };

const R = ResourceType;

function res(title: string, type: ResourceType, provider: string, url: string, durationMin = 30) {
  return { title, type, provider, url, durationMin };
}

export const ROADMAP_TEMPLATES: Tmpl[] = [
  {
    keywords: ['frontend', 'front-end', 'front end', 'react', 'web developer', 'ui developer'],
    targetRole: 'Frontend Developer',
    level: ExperienceLevel.BEGINNER,
    estimatedWeeks: 16,
    stages: [
      {
        order: 1, milestone: false, title: 'Web Foundations',
        description: 'HTML, CSS and how the browser works.',
        skills: [
          { name: 'HTML', category: 'Markup' },
          { name: 'CSS', category: 'Styling' },
          { name: 'Responsive Design', category: 'Styling' },
        ],
        resources: [
          res('MDN HTML Basics', R.ARTICLE, 'MDN', 'https://developer.mozilla.org/en-US/docs/Learn/HTML', 60),
          res('CSS Flexbox & Grid', R.YOUTUBE, 'YouTube', 'https://www.youtube.com/watch?v=JJSoEo8JSnc', 90),
        ],
        tasks: [
          { title: 'Build a responsive landing page', description: 'Recreate a product hero with HTML/CSS only.', isAutoChecked: false },
        ],
      },
      {
        order: 2, milestone: false, title: 'JavaScript Core',
        description: 'Language fundamentals, DOM, async.',
        skills: [
          { name: 'JavaScript', category: 'Language' },
          { name: 'DOM Manipulation', category: 'Language' },
          { name: 'Async / Promises', category: 'Language' },
        ],
        resources: [
          res('JavaScript.info', R.ARTICLE, 'javascript.info', 'https://javascript.info', 120),
          res('Async JS Crash Course', R.YOUTUBE, 'YouTube', 'https://www.youtube.com/watch?v=PoRJizFvM7s', 60),
        ],
        tasks: [
          { title: 'Build a todo app in vanilla JS', description: 'CRUD with localStorage.', isAutoChecked: false },
        ],
      },
      {
        order: 3, milestone: true, title: 'React & Component Thinking',
        description: 'Build UIs with components, state and hooks.',
        skills: [
          { name: 'React', category: 'Framework' },
          { name: 'React Hooks', category: 'Framework' },
          { name: 'State Management', category: 'Framework' },
        ],
        resources: [
          res('React Official Tutorial', R.ARTICLE, 'react.dev', 'https://react.dev/learn', 120),
          res('TanStack Query Docs', R.ARTICLE, 'TanStack', 'https://tanstack.com/query', 45),
        ],
        tasks: [
          { title: 'Build a weather dashboard', description: 'Consume a public API with React Query.', isAutoChecked: false },
        ],
      },
      {
        order: 4, milestone: false, title: 'Tooling & TypeScript',
        description: 'Type safety, bundlers and modern workflow.',
        skills: [
          { name: 'TypeScript', category: 'Language' },
          { name: 'Vite / Next.js', category: 'Tooling' },
          { name: 'Tailwind CSS', category: 'Styling' },
        ],
        resources: [
          res('TypeScript Handbook', R.ARTICLE, 'typescriptlang.org', 'https://www.typescriptlang.org/docs/handbook/intro.html', 90),
        ],
        tasks: [
          { title: 'Convert your React app to TypeScript', description: 'Add types and strict mode.', isAutoChecked: false },
        ],
      },
      {
        order: 5, milestone: true, title: 'Portfolio & Interview Prep',
        description: 'Ship projects and prepare for interviews.',
        skills: [
          { name: 'Testing (Jest/RTL)', category: 'Quality' },
          { name: 'Accessibility', category: 'Quality' },
          { name: 'System Design (FE)', category: 'Interview' },
        ],
        resources: [
          res('Frontend Interview Handbook', R.ARTICLE, 'GreatFrontEnd', 'https://www.frontendinterviewhandbook.com', 90),
        ],
        tasks: [
          { title: 'Deploy a polished portfolio', description: 'Three projects + write-ups, deployed live.', isAutoChecked: false },
        ],
      },
    ],
  },
  {
    keywords: ['backend', 'back-end', 'back end', 'node', 'api developer', 'server'],
    targetRole: 'Backend Developer',
    level: ExperienceLevel.BEGINNER,
    estimatedWeeks: 18,
    stages: [
      {
        order: 1, milestone: false, title: 'Programming & CS Basics',
        description: 'A backend language and core data structures.',
        skills: [
          { name: 'Node.js', category: 'Runtime' },
          { name: 'Data Structures', category: 'CS' },
          { name: 'Git', category: 'Tooling' },
        ],
        resources: [res('Node.js Docs', R.ARTICLE, 'nodejs.org', 'https://nodejs.org/en/learn', 90)],
        tasks: [{ title: 'Build a CLI tool', description: 'A small command-line app in Node.', isAutoChecked: false }],
      },
      {
        order: 2, milestone: true, title: 'APIs & Frameworks',
        description: 'Design and build REST APIs.',
        skills: [
          { name: 'REST API Design', category: 'API' },
          { name: 'Express / NestJS', category: 'Framework' },
          { name: 'Authentication (JWT)', category: 'Security' },
        ],
        resources: [res('NestJS Docs', R.ARTICLE, 'nestjs.com', 'https://docs.nestjs.com', 120)],
        tasks: [{ title: 'Build a CRUD API with auth', description: 'JWT-protected resource API.', isAutoChecked: false }],
      },
      {
        order: 3, milestone: false, title: 'Databases',
        description: 'Relational + ORM + modeling.',
        skills: [
          { name: 'PostgreSQL', category: 'Database' },
          { name: 'Prisma / ORM', category: 'Database' },
          { name: 'Data Modeling', category: 'Database' },
        ],
        resources: [res('Prisma Docs', R.ARTICLE, 'prisma.io', 'https://www.prisma.io/docs', 90)],
        tasks: [{ title: 'Model and migrate a schema', description: 'Design a normalized schema with relations.', isAutoChecked: false }],
      },
      {
        order: 4, milestone: true, title: 'Production Concerns',
        description: 'Testing, caching, deployment, observability.',
        skills: [
          { name: 'Testing', category: 'Quality' },
          { name: 'Docker', category: 'DevOps' },
          { name: 'Caching (Redis)', category: 'Performance' },
        ],
        resources: [res('Docker Getting Started', R.ARTICLE, 'docker.com', 'https://docs.docker.com/get-started', 60)],
        tasks: [{ title: 'Dockerize and deploy your API', description: 'Container + managed Postgres.', isAutoChecked: false }],
      },
    ],
  },
  {
    keywords: ['product manager', 'product management', 'pm', 'product owner'],
    targetRole: 'Product Manager',
    level: ExperienceLevel.BEGINNER,
    estimatedWeeks: 14,
    stages: [
      {
        order: 1, milestone: false, title: 'Product Fundamentals',
        description: 'What PMs do and how products are built.',
        skills: [
          { name: 'Product Discovery', category: 'Product' },
          { name: 'User Research', category: 'Research' },
          { name: 'Roadmapping', category: 'Product' },
        ],
        resources: [res('Inspired (book notes)', R.ARTICLE, 'SVPG', 'https://www.svpg.com/inspired-how-to-create-products-customers-love', 60)],
        tasks: [{ title: 'Write a one-pager', description: 'Problem, users, solution, success metrics.', isAutoChecked: false }],
      },
      {
        order: 2, milestone: true, title: 'Execution & Analytics',
        description: 'Specs, prioritization and metrics.',
        skills: [
          { name: 'Prioritization (RICE)', category: 'Product' },
          { name: 'Analytics', category: 'Data' },
          { name: 'A/B Testing', category: 'Data' },
        ],
        resources: [res('Lenny’s Newsletter', R.ARTICLE, 'Lenny', 'https://www.lennysnewsletter.com', 45)],
        tasks: [{ title: 'Define a metrics tree', description: 'North-star + input metrics for a product.', isAutoChecked: false }],
      },
      {
        order: 3, milestone: true, title: 'Stakeholders & Interview Prep',
        description: 'Communication and PM interviews.',
        skills: [
          { name: 'Stakeholder Mgmt', category: 'Leadership' },
          { name: 'Product Sense', category: 'Interview' },
          { name: 'Estimation', category: 'Interview' },
        ],
        resources: [res('Exponent PM Prep', R.ARTICLE, 'Exponent', 'https://www.tryexponent.com/courses/pm', 90)],
        tasks: [{ title: 'Mock a product-sense interview', description: 'Design X for Y, end to end.', isAutoChecked: false }],
      },
    ],
  },
  {
    keywords: ['ui/ux', 'ux', 'ui', 'designer', 'product designer', 'ux designer'],
    targetRole: 'UI/UX Designer',
    level: ExperienceLevel.BEGINNER,
    estimatedWeeks: 14,
    stages: [
      {
        order: 1, milestone: false, title: 'Design Foundations',
        description: 'Visual principles and UX thinking.',
        skills: [
          { name: 'Visual Hierarchy', category: 'Design' },
          { name: 'Typography', category: 'Design' },
          { name: 'Color Theory', category: 'Design' },
        ],
        resources: [res('Refactoring UI', R.ARTICLE, 'refactoringui', 'https://www.refactoringui.com', 60)],
        tasks: [{ title: 'Redesign a familiar screen', description: 'Improve hierarchy and spacing.', isAutoChecked: false }],
      },
      {
        order: 2, milestone: true, title: 'Tools & Prototyping',
        description: 'Figma, components and prototypes.',
        skills: [
          { name: 'Figma', category: 'Tooling' },
          { name: 'Design Systems', category: 'Design' },
          { name: 'Prototyping', category: 'Design' },
        ],
        resources: [res('Figma Learn', R.VIDEO, 'Figma', 'https://help.figma.com', 90)],
        tasks: [{ title: 'Build a mini design system', description: 'Tokens, buttons, inputs, cards.', isAutoChecked: false }],
      },
      {
        order: 3, milestone: true, title: 'Portfolio & Case Studies',
        description: 'Tell the story behind your work.',
        skills: [
          { name: 'UX Research', category: 'Research' },
          { name: 'Case Studies', category: 'Portfolio' },
          { name: 'Usability Testing', category: 'Research' },
        ],
        resources: [res('Case Study Guide', R.ARTICLE, 'NN/g', 'https://www.nngroup.com/articles', 45)],
        tasks: [{ title: 'Publish two case studies', description: 'Problem → process → outcome.', isAutoChecked: false }],
      },
    ],
  },
  {
    keywords: ['data analyst', 'data analytics', 'analyst', 'bi'],
    targetRole: 'Data Analyst',
    level: ExperienceLevel.BEGINNER,
    estimatedWeeks: 16,
    stages: [
      {
        order: 1, milestone: false, title: 'Spreadsheets & SQL',
        description: 'The analyst’s daily tools.',
        skills: [
          { name: 'Excel / Sheets', category: 'Tooling' },
          { name: 'SQL', category: 'Data' },
          { name: 'Data Cleaning', category: 'Data' },
        ],
        resources: [res('Mode SQL Tutorial', R.ARTICLE, 'Mode', 'https://mode.com/sql-tutorial', 120)],
        tasks: [{ title: 'Answer 10 business questions with SQL', description: 'Use a public dataset.', isAutoChecked: false }],
      },
      {
        order: 2, milestone: true, title: 'Visualization & BI',
        description: 'Communicate insight visually.',
        skills: [
          { name: 'Data Visualization', category: 'Data' },
          { name: 'Tableau / Power BI', category: 'Tooling' },
          { name: 'Dashboards', category: 'Data' },
        ],
        resources: [res('Storytelling with Data', R.ARTICLE, 'SWD', 'https://www.storytellingwithdata.com', 60)],
        tasks: [{ title: 'Build an interactive dashboard', description: 'KPIs with filters and a narrative.', isAutoChecked: false }],
      },
      {
        order: 3, milestone: true, title: 'Statistics & Python',
        description: 'Add rigor and automation.',
        skills: [
          { name: 'Statistics', category: 'Math' },
          { name: 'Python (pandas)', category: 'Programming' },
          { name: 'A/B Testing', category: 'Math' },
        ],
        resources: [res('pandas Docs', R.ARTICLE, 'pandas', 'https://pandas.pydata.org/docs', 90)],
        tasks: [{ title: 'Run an A/B test analysis', description: 'Significance and recommendation.', isAutoChecked: false }],
      },
    ],
  },
  {
    keywords: ['qa', 'quality assurance', 'tester', 'automation engineer', 'sdet'],
    targetRole: 'QA Engineer',
    level: ExperienceLevel.BEGINNER,
    estimatedWeeks: 12,
    stages: [
      {
        order: 1, milestone: false, title: 'Testing Foundations',
        description: 'Test design and manual QA.',
        skills: [
          { name: 'Test Cases', category: 'QA' },
          { name: 'Bug Reporting', category: 'QA' },
          { name: 'Test Planning', category: 'QA' },
        ],
        resources: [res('ISTQB Foundations', R.ARTICLE, 'ISTQB', 'https://www.istqb.org', 60)],
        tasks: [{ title: 'Write a test plan', description: 'For a small web app feature.', isAutoChecked: false }],
      },
      {
        order: 2, milestone: true, title: 'Automation',
        description: 'Automate UI and API tests.',
        skills: [
          { name: 'Selenium / Playwright', category: 'Automation' },
          { name: 'API Testing', category: 'Automation' },
          { name: 'JavaScript/Python', category: 'Programming' },
        ],
        resources: [res('Playwright Docs', R.ARTICLE, 'Playwright', 'https://playwright.dev', 90)],
        tasks: [{ title: 'Automate a checkout flow', description: 'End-to-end with Playwright.', isAutoChecked: false }],
      },
      {
        order: 3, milestone: true, title: 'CI & Quality Culture',
        description: 'Integrate tests into delivery.',
        skills: [
          { name: 'CI/CD', category: 'DevOps' },
          { name: 'Performance Testing', category: 'QA' },
          { name: 'Test Strategy', category: 'QA' },
        ],
        resources: [res('GitHub Actions', R.ARTICLE, 'GitHub', 'https://docs.github.com/actions', 45)],
        tasks: [{ title: 'Run tests in CI', description: 'Gate merges on a passing suite.', isAutoChecked: false }],
      },
    ],
  },
  {
    keywords: ['ai engineer', 'machine learning', 'ml engineer', 'ai', 'ml', 'data scientist'],
    targetRole: 'AI Engineer',
    level: ExperienceLevel.JUNIOR,
    estimatedWeeks: 20,
    stages: [
      {
        order: 1, milestone: false, title: 'Python & Math',
        description: 'Programming and the math behind ML.',
        skills: [
          { name: 'Python', category: 'Programming' },
          { name: 'Linear Algebra', category: 'Math' },
          { name: 'Probability', category: 'Math' },
        ],
        resources: [res('fast.ai', R.ARTICLE, 'fast.ai', 'https://www.fast.ai', 120)],
        tasks: [{ title: 'Implement gradient descent', description: 'From scratch in NumPy.', isAutoChecked: false }],
      },
      {
        order: 2, milestone: true, title: 'Machine Learning',
        description: 'Classical ML and evaluation.',
        skills: [
          { name: 'scikit-learn', category: 'ML' },
          { name: 'Model Evaluation', category: 'ML' },
          { name: 'Feature Engineering', category: 'ML' },
        ],
        resources: [res('scikit-learn Docs', R.ARTICLE, 'sklearn', 'https://scikit-learn.org/stable', 90)],
        tasks: [{ title: 'Train & evaluate a classifier', description: 'With cross-validation.', isAutoChecked: false }],
      },
      {
        order: 3, milestone: false, title: 'Deep Learning & LLMs',
        description: 'Neural nets and modern LLM apps.',
        skills: [
          { name: 'PyTorch', category: 'DL' },
          { name: 'Transformers', category: 'DL' },
          { name: 'LLM App Dev (RAG)', category: 'LLM' },
        ],
        resources: [res('Hugging Face Course', R.ARTICLE, 'HF', 'https://huggingface.co/learn', 120)],
        tasks: [{ title: 'Build a RAG chatbot', description: 'Embeddings + retrieval + generation.', isAutoChecked: false }],
      },
      {
        order: 4, milestone: true, title: 'MLOps & Portfolio',
        description: 'Deploy and showcase ML systems.',
        skills: [
          { name: 'Model Serving', category: 'MLOps' },
          { name: 'Vector Databases', category: 'MLOps' },
          { name: 'Monitoring', category: 'MLOps' },
        ],
        resources: [res('Made With ML', R.ARTICLE, 'MadeWithML', 'https://madewithml.com', 120)],
        tasks: [{ title: 'Ship an ML-powered app', description: 'API + UI + deployment.', isAutoChecked: false }],
      },
    ],
  },
];

export function pickTemplate(targetRole: string): Tmpl {
  const q = targetRole.toLowerCase();
  const match = ROADMAP_TEMPLATES.find((t) =>
    t.keywords.some((k) => q.includes(k)),
  );
  return match ?? ROADMAP_TEMPLATES[0];
}
