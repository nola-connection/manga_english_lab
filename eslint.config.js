import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

// Shared flat config applied to both the `client` and `server` workspaces.
// React-specific rules are scoped to `client`; `eslint-config-prettier` is
// last so it can disable any stylistic rules that would fight Prettier.
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
    ],
  },

  // Base rules shared across both workspaces (ES modules).
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
  },

  // Client workspace: React rules and browser globals.
  {
    files: ["client/**/*.{js,jsx}"],
    ...react.configs.flat.recommended,
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Client uses the automatic JSX runtime (Vite default), so React need not be
  // imported into scope. Disables react-in-jsx-scope / jsx-uses-react.
  {
    files: ["client/**/*.{js,jsx}"],
    ...react.configs.flat["jsx-runtime"],
  },
  {
    files: ["client/**/*.{js,jsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // PropTypes are deprecated in React 19; we rely on JSDoc/tests instead of
      // runtime prop validation, so disable the prop-types requirement.
      "react/prop-types": "off",
    },
  },

  // Vitest globals (globals:true) for client test files and the shared setup.
  {
    files: [
      "client/**/*.{test,spec}.{js,jsx}",
      "client/src/test/**/*.{js,jsx}",
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
  },

  // Turn off formatting-related rules that conflict with Prettier. Keep last.
  prettier,
];
