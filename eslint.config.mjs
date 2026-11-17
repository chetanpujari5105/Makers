import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Catch accidental `any` and unused code early.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Stray console.log calls can leak personal data into logs; use warn/error deliberately.
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // New shadcn components import `cn` from the "cn" package, which mangles
      // our custom tokens (see docs/DECISIONS.md). Use the configured helper.
      "no-restricted-imports": [
        "error",
        {
          paths: [{ name: "cn", message: 'Import { cn } from "@/lib/utils" instead.' }],
        },
      ],
    },
  },
  // Turn off style rules that Prettier handles (must come last).
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);

export default eslintConfig;
