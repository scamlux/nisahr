/**
 * F6 final-assessment question bank. Ships versioned in code (like the RIASEC
 * bank) — only attempts/scores live in the DB. Correct answers live here and
 * MUST NOT reach the client: serve questions through {@link publicQuestion}.
 */
export const ASSESSMENT_VERSION = 'final-v1';

/** How many questions are served per attempt (bank may hold more). */
export const QUESTIONS_PER_ATTEMPT = 8;
export const DEFAULT_TIME_LIMIT_SEC = 15 * 60;
export const DEFAULT_PASS_THRESHOLD = 70;

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index into `options`. Server-only — stripped before sending to clients. */
  correctIndex: number;
  topic: string;
}

/** A question as sent to the client — never carries the answer key. */
export interface PublicQuestion {
  id: string;
  prompt: string;
  options: string[];
  topic: string;
}

export interface AssessmentBank {
  slug: string;
  role: string;
  questions: AssessmentQuestion[];
}

export function publicQuestion(q: AssessmentQuestion): PublicQuestion {
  return { id: q.id, prompt: q.prompt, options: q.options, topic: q.topic };
}

const frontend: AssessmentBank = {
  slug: 'frontend-developer',
  role: 'Frontend Developer',
  questions: [
    { id: 'fe1', topic: 'HTML', prompt: 'Which element best represents the primary navigation of a page?', options: ['<div class="nav">', '<nav>', '<section>', '<aside>'], correctIndex: 1 },
    { id: 'fe2', topic: 'CSS', prompt: 'Which CSS layout system is designed for one-dimensional layouts (a row OR a column)?', options: ['Grid', 'Flexbox', 'Float', 'Table'], correctIndex: 1 },
    { id: 'fe3', topic: 'JavaScript', prompt: 'What does `const` guarantee in JavaScript?', options: ['The value is deeply immutable', 'The binding cannot be reassigned', 'The variable is hoisted and initialized as undefined', 'It creates a global variable'], correctIndex: 1 },
    { id: 'fe4', topic: 'JavaScript', prompt: 'Which method returns a new array without mutating the original?', options: ['push', 'splice', 'map', 'sort'], correctIndex: 2 },
    { id: 'fe5', topic: 'React', prompt: 'When does a React `useEffect` with an empty dependency array run?', options: ['On every render', 'Only once after the first render', 'Never', 'Only when props change'], correctIndex: 1 },
    { id: 'fe6', topic: 'React', prompt: 'Why do lists in React need a stable `key` prop?', options: ['To style each item', 'To help React match elements between renders efficiently', 'It is required by HTML', 'To sort the list automatically'], correctIndex: 1 },
    { id: 'fe7', topic: 'Accessibility', prompt: 'What is the main purpose of an `alt` attribute on an image?', options: ['Improve load speed', 'Describe the image for screen readers and when it fails to load', 'Set the image size', 'Add a caption below the image'], correctIndex: 1 },
    { id: 'fe8', topic: 'Web', prompt: 'Which HTTP status code indicates a resource was not found?', options: ['200', '301', '404', '500'], correctIndex: 2 },
    { id: 'fe9', topic: 'CSS', prompt: 'Which unit is relative to the root element font size?', options: ['px', 'em', 'rem', 'pt'], correctIndex: 2 },
    { id: 'fe10', topic: 'JavaScript', prompt: 'What does `Promise.all` resolve to?', options: ['The first resolved value', 'An array of all resolved values', 'The last resolved value', 'undefined'], correctIndex: 1 },
  ],
};

const backend: AssessmentBank = {
  slug: 'backend-developer',
  role: 'Backend Developer',
  questions: [
    { id: 'be1', topic: 'HTTP', prompt: 'Which HTTP method is idempotent and used to fully replace a resource?', options: ['POST', 'PUT', 'PATCH', 'CONNECT'], correctIndex: 1 },
    { id: 'be2', topic: 'HTTP', prompt: 'A `401` response means:', options: ['The server errored', 'The request is unauthenticated', 'The resource moved', 'Too many requests'], correctIndex: 1 },
    { id: 'be3', topic: 'Databases', prompt: 'What does a foreign key enforce?', options: ['Uniqueness of a column', 'Referential integrity between tables', 'Automatic indexing', 'Encryption of a column'], correctIndex: 1 },
    { id: 'be4', topic: 'Databases', prompt: 'Which SQL clause filters rows AFTER aggregation?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correctIndex: 1 },
    { id: 'be5', topic: 'Databases', prompt: 'Adding an index to a column primarily improves:', options: ['Write speed', 'Read/lookup speed', 'Storage size', 'Backup speed'], correctIndex: 1 },
    { id: 'be6', topic: 'Auth', prompt: 'Passwords should be stored as:', options: ['Plain text', 'Reversible encryption', 'A salted one-way hash (e.g. bcrypt)', 'Base64 encoding'], correctIndex: 2 },
    { id: 'be7', topic: 'APIs', prompt: 'In REST, which status code best fits a successful resource creation?', options: ['200', '201', '204', '302'], correctIndex: 1 },
    { id: 'be8', topic: 'Concurrency', prompt: 'What problem do database transactions primarily solve?', options: ['Faster queries', 'Atomicity/consistency of multi-step changes', 'Smaller storage', 'Automatic caching'], correctIndex: 1 },
    { id: 'be9', topic: 'Caching', prompt: 'A cache with a TTL will:', options: ['Never expire entries', 'Expire entries after a set time', 'Only store images', 'Replace the database'], correctIndex: 1 },
    { id: 'be10', topic: 'APIs', prompt: 'Which is a key benefit of statelessness in REST APIs?', options: ['Sessions are stored on the server', 'Each request contains all needed context, aiding scalability', 'It requires sticky sessions', 'It disables caching'], correctIndex: 1 },
  ],
};

const dataAnalyst: AssessmentBank = {
  slug: 'data-analyst',
  role: 'Data Analyst',
  questions: [
    { id: 'da1', topic: 'SQL', prompt: 'Which JOIN returns only rows with matches in both tables?', options: ['LEFT JOIN', 'INNER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'], correctIndex: 1 },
    { id: 'da2', topic: 'SQL', prompt: 'Which aggregate function counts non-null values in a column?', options: ['SUM', 'COUNT', 'AVG', 'MAX'], correctIndex: 1 },
    { id: 'da3', topic: 'Statistics', prompt: 'The median is preferred over the mean when data is:', options: ['Perfectly normal', 'Skewed or has outliers', 'Categorical', 'Missing'], correctIndex: 1 },
    { id: 'da4', topic: 'Statistics', prompt: 'What does standard deviation measure?', options: ['The central value', 'The spread of values around the mean', 'The most frequent value', 'The correlation'], correctIndex: 1 },
    { id: 'da5', topic: 'Visualization', prompt: 'Which chart best shows the trend of a metric over time?', options: ['Pie chart', 'Line chart', 'Treemap', 'Histogram'], correctIndex: 1 },
    { id: 'da6', topic: 'Visualization', prompt: 'A histogram is best used to show:', options: ['Category proportions', 'The distribution of a numeric variable', 'Correlation between two variables', 'Change over time'], correctIndex: 1 },
    { id: 'da7', topic: 'Data', prompt: 'Correlation implies:', options: ['Causation', 'A statistical association, not necessarily causation', 'Nothing useful', 'A perfect linear relationship'], correctIndex: 1 },
    { id: 'da8', topic: 'SQL', prompt: 'Which clause limits the number of returned rows?', options: ['WHERE', 'LIMIT', 'HAVING', 'DISTINCT'], correctIndex: 1 },
    { id: 'da9', topic: 'Cleaning', prompt: 'A common first step when facing missing values is to:', options: ['Delete the whole dataset', 'Understand why they are missing before deciding how to handle them', 'Always replace with zero', 'Ignore them permanently'], correctIndex: 1 },
  ],
};

const aiEngineer: AssessmentBank = {
  slug: 'ai-engineer',
  role: 'AI Engineer',
  questions: [
    { id: 'ai1', topic: 'ML', prompt: 'Supervised learning requires:', options: ['Only input data', 'Labeled input/output pairs', 'No data', 'Only rewards'], correctIndex: 1 },
    { id: 'ai2', topic: 'ML', prompt: 'Overfitting is when a model:', options: ['Performs poorly on training data', 'Memorizes training data and generalizes poorly', 'Trains too quickly', 'Uses too little data'], correctIndex: 1 },
    { id: 'ai3', topic: 'ML', prompt: 'A train/test split exists primarily to:', options: ['Speed up training', 'Estimate performance on unseen data', 'Reduce dataset size', 'Label the data'], correctIndex: 1 },
    { id: 'ai4', topic: 'Metrics', prompt: 'For an imbalanced classification problem, which metric is more informative than accuracy?', options: ['F1 score', 'Total row count', 'Learning rate', 'Batch size'], correctIndex: 0 },
    { id: 'ai5', topic: 'LLMs', prompt: 'In LLMs, a "token" is roughly:', options: ['A full sentence', 'A chunk of text (word or subword)', 'A model weight', 'A GPU core'], correctIndex: 1 },
    { id: 'ai6', topic: 'LLMs', prompt: 'What does RAG (retrieval-augmented generation) add to an LLM?', options: ['More parameters', 'External knowledge fetched at query time', 'Faster GPUs', 'Lower temperature only'], correctIndex: 1 },
    { id: 'ai7', topic: 'Training', prompt: 'The learning rate controls:', options: ['The size of weight updates during training', 'The number of layers', 'The dataset size', 'The batch order'], correctIndex: 0 },
    { id: 'ai8', topic: 'Data', prompt: 'Why split data before scaling/normalizing?', options: ['To save memory', 'To avoid leaking test statistics into training', 'It has no effect', 'To shuffle faster'], correctIndex: 1 },
    { id: 'ai9', topic: 'LLMs', prompt: 'Lower "temperature" in generation tends to produce:', options: ['More random output', 'More deterministic/focused output', 'Longer output', 'More tokens'], correctIndex: 1 },
  ],
};

const uiux: AssessmentBank = {
  slug: 'ui-ux-designer',
  role: 'UI/UX Designer',
  questions: [
    { id: 'ux1', topic: 'Process', prompt: 'A wireframe is primarily used to:', options: ['Finalize colors', 'Lay out structure and hierarchy before visual design', 'Write production code', 'Pick fonts'], correctIndex: 1 },
    { id: 'ux2', topic: 'Research', prompt: 'Usability testing is best done:', options: ['Only after launch', 'Early and iteratively with real users', 'Never', 'Only by the design team'], correctIndex: 1 },
    { id: 'ux3', topic: 'Hierarchy', prompt: 'Visual hierarchy is mainly achieved through:', options: ['Random placement', 'Size, contrast, spacing and color', 'Only animation', 'Using more fonts'], correctIndex: 1 },
    { id: 'ux4', topic: 'Accessibility', prompt: 'WCAG AA requires a minimum contrast ratio for normal text of about:', options: ['1.5:1', '4.5:1', '10:1', '2:1'], correctIndex: 1 },
    { id: 'ux5', topic: 'Heuristics', prompt: 'Nielsen’s "visibility of system status" heuristic means:', options: ['Hide loading states', 'Keep users informed about what is happening', 'Use fewer screens', 'Avoid feedback'], correctIndex: 1 },
    { id: 'ux6', topic: 'Design systems', prompt: 'A design system primarily provides:', options: ['One-off screens', 'Reusable components and tokens for consistency', 'Marketing copy', 'Backend APIs'], correctIndex: 1 },
    { id: 'ux7', topic: 'Prototyping', prompt: 'A prototype is most useful for:', options: ['Shipping to production', 'Testing flows and interactions before building', 'Storing data', 'Writing tests'], correctIndex: 1 },
    { id: 'ux8', topic: 'Layout', prompt: 'An 8pt spacing grid helps by:', options: ['Making text smaller', 'Creating consistent, scalable rhythm in layouts', 'Removing whitespace', 'Randomizing spacing'], correctIndex: 1 },
    { id: 'ux9', topic: 'Research', prompt: 'A persona is:', options: ['A real customer’s account', 'A model of a representative user to guide decisions', 'A color palette', 'A component library'], correctIndex: 1 },
  ],
};

const qa: AssessmentBank = {
  slug: 'qa-engineer',
  role: 'QA Engineer',
  questions: [
    { id: 'qa1', topic: 'Fundamentals', prompt: 'The main goal of software testing is to:', options: ['Prove there are no bugs', 'Find defects and reduce risk before release', 'Write more code', 'Replace developers'], correctIndex: 1 },
    { id: 'qa2', topic: 'Test design', prompt: 'Boundary value analysis focuses on:', options: ['Random inputs', 'Values at the edges of input ranges', 'Only valid inputs', 'UI colors'], correctIndex: 1 },
    { id: 'qa3', topic: 'Test design', prompt: 'Equivalence partitioning is used to:', options: ['Group inputs that should behave the same to reduce test cases', 'Test every possible value', 'Skip testing', 'Measure performance'], correctIndex: 0 },
    { id: 'qa4', topic: 'Levels', prompt: 'A unit test typically verifies:', options: ['The whole system end-to-end', 'A single function/module in isolation', 'The database only', 'User acceptance'], correctIndex: 1 },
    { id: 'qa5', topic: 'Automation', prompt: 'Which tool is commonly used for browser end-to-end testing?', options: ['Playwright', 'PostgreSQL', 'Webpack', 'Redis'], correctIndex: 0 },
    { id: 'qa6', topic: 'Reporting', prompt: 'A good bug report must include:', options: ['Only a screenshot', 'Steps to reproduce, expected vs actual results', 'The developer’s name', 'A guess at the fix'], correctIndex: 1 },
    { id: 'qa7', topic: 'CI', prompt: 'Running tests in CI on every push mainly helps to:', options: ['Slow down releases', 'Catch regressions early and automatically', 'Replace code review', 'Deploy to production'], correctIndex: 1 },
    { id: 'qa8', topic: 'Types', prompt: 'Regression testing checks that:', options: ['New features work only', 'Existing functionality still works after changes', 'The UI is pretty', 'The database is fast'], correctIndex: 1 },
    { id: 'qa9', topic: 'Strategy', prompt: 'The "test pyramid" suggests having the most:', options: ['End-to-end tests', 'Unit tests at the base', 'Manual tests', 'No tests'], correctIndex: 1 },
  ],
};

const general: AssessmentBank = {
  slug: 'general',
  role: 'Tech Professional',
  questions: [
    { id: 'ge1', topic: 'Version control', prompt: 'What does `git commit` do?', options: ['Uploads to GitHub', 'Records staged changes to the local repository', 'Deletes a branch', 'Merges automatically'], correctIndex: 1 },
    { id: 'ge2', topic: 'Version control', prompt: 'A branch in Git is:', options: ['A backup server', 'A movable pointer to a line of development', 'A merge conflict', 'A remote only'], correctIndex: 1 },
    { id: 'ge3', topic: 'Web', prompt: 'What does an API do?', options: ['Styles a page', 'Defines how programs communicate and exchange data', 'Stores images', 'Compiles code'], correctIndex: 1 },
    { id: 'ge4', topic: 'Data', prompt: 'JSON is primarily used to:', options: ['Style pages', 'Structure and exchange data', 'Query databases', 'Compress video'], correctIndex: 1 },
    { id: 'ge5', topic: 'Problem solving', prompt: 'A good first step when debugging is to:', options: ['Rewrite everything', 'Reproduce the problem reliably', 'Blame the framework', 'Delete tests'], correctIndex: 1 },
    { id: 'ge6', topic: 'Agile', prompt: 'A sprint in Agile is:', options: ['A one-time deadline', 'A short, fixed time-box to deliver working increments', 'A bug report', 'A design tool'], correctIndex: 1 },
    { id: 'ge7', topic: 'Security', prompt: 'Why avoid committing secrets (API keys) to a repo?', options: ['They slow builds', 'They can be exposed and abused', 'They break syntax', 'They are too large'], correctIndex: 1 },
    { id: 'ge8', topic: 'Collaboration', prompt: 'The main purpose of code review is to:', options: ['Assign blame', 'Improve quality and share knowledge', 'Slow the team', 'Avoid tests'], correctIndex: 1 },
  ],
};

export const QUESTION_BANKS: AssessmentBank[] = [
  frontend, backend, dataAnalyst, aiEngineer, uiux, qa, general,
];

const ALIASES: Record<string, string> = {
  frontend: 'frontend-developer',
  'front-end': 'frontend-developer',
  'frontend developer': 'frontend-developer',
  backend: 'backend-developer',
  'back-end': 'backend-developer',
  'backend developer': 'backend-developer',
  'data analyst': 'data-analyst',
  data: 'data-analyst',
  'ai engineer': 'ai-engineer',
  ai: 'ai-engineer',
  'ml engineer': 'ai-engineer',
  'machine learning': 'ai-engineer',
  'ui/ux designer': 'ui-ux-designer',
  'ux designer': 'ui-ux-designer',
  'ui designer': 'ui-ux-designer',
  designer: 'ui-ux-designer',
  'qa engineer': 'qa-engineer',
  qa: 'qa-engineer',
  tester: 'qa-engineer',
};

/** Resolve a role or slug to a question bank; falls back to the general bank. */
export function findBank(roleOrSlug: string): AssessmentBank {
  const key = (roleOrSlug ?? '').toLowerCase().trim();
  const direct = QUESTION_BANKS.find((b) => b.slug === key);
  if (direct) return direct;
  const aliased = ALIASES[key];
  if (aliased) return QUESTION_BANKS.find((b) => b.slug === aliased)!;
  // partial contains (e.g. "Senior Frontend Developer")
  for (const [alias, slug] of Object.entries(ALIASES)) {
    if (key.includes(alias)) return QUESTION_BANKS.find((b) => b.slug === slug)!;
  }
  return general;
}
