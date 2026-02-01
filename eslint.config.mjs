import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Build outputs
    ".next/**",
    "out/**",
    "dist/**",
    "build/**",
    "next-env.d.ts",
    // Generated/report files
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
    // Dependencies
    "node_modules/**",
    // Cache
    ".cache/**",
    ".turbo/**",
    // Prisma generated
    "prisma/generated/**",
    // Public assets (not code)
    "public/**",
  ]),
  // Security: Prevent console.log in production code
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
    ignores: [
      // Allow console in scripts and tests
      "scripts/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "tests/**",
      "__tests__/**",
    ],
  },
]);

export default eslintConfig;
