/**
 * skillNormalization.js — SkillSwap
 * Centralized, deterministic, rule-based skill normalization and canonical alias resolution.
 * 
 * Rules:
 * 1. Fast, deterministic, and explainable (NO AI / LLM / external APIs).
 * 2. Resolves equivalent skill representations, abbreviations, spacing, casing, and punctuation.
 * 3. Prevents false equivalences (e.g. Java !== JavaScript, React Native !== React, Python !== Django, Figma !== UI/UX Design).
 * 4. Preserves unknown skills safely in clean normalized form.
 */

// Centralized alias mapping: maps cleaned alias variations to canonical names
const SKILL_ALIASES = {
  // JavaScript
  "js": "javascript",
  "javascript": "javascript",
  "java script": "javascript",
  "java-script": "javascript",
  "vanilla js": "javascript",
  "vanilla javascript": "javascript",
  "js language": "javascript",

  // Node.js
  "node": "node.js",
  "nodejs": "node.js",
  "node.js": "node.js",
  "node js": "node.js",
  "node-js": "node.js",

  // React
  "react": "react",
  "reactjs": "react",
  "react.js": "react",
  "react js": "react",
  "react-js": "react",

  // React Native (Explicitly distinct from React!)
  "react native": "react native",
  "react-native": "react native",
  "reactnative": "react native",

  // UI/UX Design
  "ui ux": "ui/ux design",
  "ui/ux": "ui/ux design",
  "ui ux design": "ui/ux design",
  "ui/ux design": "ui/ux design",
  "ui ux designing": "ui/ux design",
  "ui/ux designing": "ui/ux design",
  "ux/ui": "ui/ux design",
  "ux/ui design": "ui/ux design",
  "ux/ui designing": "ui/ux design",
  "ux ui": "ui/ux design",
  "ux ui design": "ui/ux design",
  "ux ui designing": "ui/ux design",
  "ui-ux": "ui/ux design",
  "ux-ui": "ui/ux design",
  "ui-ux design": "ui/ux design",
  "ux-ui design": "ui/ux design",
  "ui-ux designing": "ui/ux design",
  "ux-ui designing": "ui/ux design",

  // UI Design (Distinct from UI/UX Design)
  "ui design": "ui design",
  "user interface design": "ui design",
  "ui": "ui design",

  // UX Design (Distinct from UI/UX Design)
  "ux design": "ux design",
  "user experience design": "ux design",
  "ux": "ux design",

  // Python
  "python": "python",
  "python3": "python",
  "python 3": "python",
  "py": "python",

  // C++ (Careful: preserve '+' and cpp)
  "c++": "c++",
  "cpp": "c++",
  "cplusplus": "c++",
  "c plus plus": "c++",

  // C#
  "c#": "c#",
  "csharp": "c#",
  "c sharp": "c#",

  // C
  "c": "c",
  "c language": "c",

  // Java (Explicitly distinct from JavaScript!)
  "java": "java",
  "core java": "java",

  // Frontend
  "frontend": "frontend",
  "front end": "frontend",
  "front-end": "frontend",
  "frontend development": "frontend",
  "front-end development": "frontend",
  "front end development": "frontend",

  // Backend
  "backend": "backend",
  "back end": "backend",
  "back-end": "backend",
  "backend development": "backend",
  "back-end development": "backend",
  "back end development": "backend",

  // Full Stack
  "fullstack": "full stack",
  "full stack": "full stack",
  "full-stack": "full stack",
  "fullstack development": "full stack",
  "full-stack development": "full stack",

  // MongoDB
  "mongodb": "mongodb",
  "mongo db": "mongodb",
  "mongo": "mongodb",

  // Express
  "express": "express.js",
  "express.js": "express.js",
  "expressjs": "express.js",
  "express js": "express.js",
  "express-js": "express.js",

  // Next.js
  "next": "next.js",
  "next.js": "next.js",
  "nextjs": "next.js",
  "next js": "next.js",
  "next-js": "next.js",

  // TypeScript
  "ts": "typescript",
  "typescript": "typescript",
  "type-script": "typescript",
  "type script": "typescript",

  // HTML
  "html": "html",
  "html5": "html",
  "html 5": "html",

  // CSS
  "css": "css",
  "css3": "css",
  "css 3": "css",

  // Tailwind CSS
  "tailwind": "tailwind css",
  "tailwindcss": "tailwind css",
  "tailwind css": "tailwind css",
  "tailwind-css": "tailwind css",

  // Vue
  "vue": "vue",
  "vue.js": "vue",
  "vuejs": "vue",
  "vue js": "vue",
  "vue-js": "vue",

  // Angular
  "angular": "angular",
  "angularjs": "angular",
  "angular.js": "angular",
  "angular js": "angular",
  "angular-js": "angular",

  // PostgreSQL
  "postgres": "postgresql",
  "postgresql": "postgresql",
  "postgre sql": "postgresql",
  "postgre": "postgresql",

  // Django (Distinct from Python!)
  "django": "django",

  // Flask (Distinct from Python!)
  "flask": "flask",

  // Figma (Distinct from UI/UX Design!)
  "figma": "figma",

  // Git / GitHub
  "git": "git",
  "github": "github",

  // Docker
  "docker": "docker",

  // Kubernetes
  "kubernetes": "kubernetes",
  "k8s": "kubernetes",

  // GraphQL
  "graphql": "graphql",
  "graph ql": "graphql",

  // SQL
  "sql": "sql",

  // Redux
  "redux": "redux",
  "redux toolkit": "redux",
  "rtk": "redux",
};

/**
 * Cleans and standardizes raw skill text
 * - Safely handles null, undefined, and non-string inputs
 * - Trims leading and trailing whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces into a single space
 * 
 * @param {string} name - Raw skill name
 * @returns {string} Cleaned skill string
 */
const cleanSkillText = (name) => {
  if (typeof name !== "string") return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

/**
 * Normalizes a skill name to its canonical identifier using deterministic alias resolution
 * - Cleans the input text
 * - Checks direct alias map lookup
 * - Evaluates punctuation variations (hyphens, dots, slashes) while preserving language symbols (+, #)
 * - Returns canonical identifier if alias exists; otherwise returns cleaned text (preserving unknown skills)
 * 
 * @param {string} name - Raw or semi-normalized skill name
 * @returns {string} Canonical skill identifier
 */
const normalizeSkillName = (name) => {
  const cleaned = cleanSkillText(name);
  if (!cleaned) return "";

  // 1. Direct alias dictionary match (O(1))
  if (Object.prototype.hasOwnProperty.call(SKILL_ALIASES, cleaned)) {
    return SKILL_ALIASES[cleaned];
  }

  // 2. Hyphen variation resolution (e.g. "java-script" -> "java script")
  if (cleaned.includes("-")) {
    const unhyphenated = cleaned.replace(/-/g, " ").replace(/\s+/g, " ");
    if (Object.prototype.hasOwnProperty.call(SKILL_ALIASES, unhyphenated)) {
      return SKILL_ALIASES[unhyphenated];
    }
  }

  // 3. Dot variation resolution (e.g. "react.js" -> "react js" or "node.js" -> "node js")
  if (cleaned.includes(".") && !cleaned.startsWith(".")) {
    const spaceDotted = cleaned.replace(/\./g, " ").replace(/\s+/g, " ");
    if (Object.prototype.hasOwnProperty.call(SKILL_ALIASES, spaceDotted)) {
      return SKILL_ALIASES[spaceDotted];
    }
    const strippedDot = cleaned.replace(/\./g, "");
    if (Object.prototype.hasOwnProperty.call(SKILL_ALIASES, strippedDot)) {
      return SKILL_ALIASES[strippedDot];
    }
  }

  // 4. Slash variation resolution for composite terms (e.g. "ui/ux" -> "ui ux")
  if (cleaned.includes("/")) {
    const spaceSlashed = cleaned.replace(/\//g, " ").replace(/\s+/g, " ");
    if (Object.prototype.hasOwnProperty.call(SKILL_ALIASES, spaceSlashed)) {
      return SKILL_ALIASES[spaceSlashed];
    }
  }

  // 5. Unknown skill fallback: return cleaned text without loss
  return cleaned;
};

/**
 * Returns canonical skill representation (alias wrapper for normalizeSkillName)
 * @param {string} name
 * @returns {string}
 */
const getCanonicalSkill = (name) => {
  return normalizeSkillName(name);
};

module.exports = {
  cleanSkillText,
  normalizeSkillName,
  getCanonicalSkill,
  SKILL_ALIASES,
};
