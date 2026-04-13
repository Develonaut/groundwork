// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import importPlugin from "eslint-plugin-import-x";
import unicorn from "eslint-plugin-unicorn";
import boundariesPlugin from "eslint-plugin-boundaries";

const restrictedImports = {
  patterns: [
    {
      group: ["@groundwork/ui/src/*"],
      message: "Import from '@groundwork/ui' barrel export, not internal paths",
    },
  ],
};

/**
 * Base ESLint config for Groundwork
 * Enforces Bento Box Principle and architectural boundaries.
 *
 * React/JSX rules are handled by eslint-config-next in apps/web.
 * This config covers TypeScript, imports, complexity, and boundaries.
 */
export const baseConfig = tseslint.config(
  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  {
    plugins: {
      sonarjs,
      "import-x": importPlugin,
      unicorn,
      boundaries: boundariesPlugin,
    },

    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "apps/*" },
        { type: "core", pattern: "packages/core" },
        { type: "ui", pattern: "packages/ui" },
      ],
    },

    rules: {
      // === Complexity and Size Enforcement (Bento Box Principle) ===
      "max-lines": ["error", { max: 250, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 20, skipBlankLines: true, skipComments: true }],
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-params": ["error", 4],

      // === SonarJS Structural Quality ===
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-duplicate-string": "error",
      "sonarjs/no-identical-functions": "error",

      // === TypeScript Rules ===
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "error",

      // === Style (Readability) ===
      "no-else-return": "error",
      "prefer-const": "error",
      "object-shorthand": "error",

      // === Import Quality ===
      "import-x/no-cycle": "error",
      "import-x/no-duplicates": "error",
      "no-restricted-imports": ["error", restrictedImports],

      // === Unicorn Cherry-Picks ===
      "unicorn/filename-case": [
        "error",
        {
          cases: { camelCase: true, pascalCase: true },
          ignore: ["^\\[.*\\]$"],
        },
      ],
      "unicorn/no-array-for-each": "error",
      "unicorn/prefer-node-protocol": "error",

      // === Boundaries (Package Dependency Rules) ===
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["core", "ui"] },
            { from: "core", allow: [] },
            { from: "ui", allow: [] },
          ],
        },
      ],
    },
  },

  // === File Naming Conventions ===
  {
    files: ["**/*.tsx"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "pascalCase",
          ignore: ["^\\[.*\\]$", "^_.*"],
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    ignores: ["**/*.tsx"],
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          case: "camelCase",
          ignore: ["^_.*"],
        },
      ],
    },
  },

  // === Ignore Patterns ===
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.ts",
      "**/pnpm-lock.yaml",
    ],
  },
);
