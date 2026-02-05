// eslint.config.mjs
import js from "@eslint/js";
import tsEslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";

export default tsEslint.config(
  js.configs.recommended,
  ...tsEslint.configs.recommended, // includes type-aware rules
  {
    plugins: {
      "react-hooks": reactHooks,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // Your overrides – disable or warn as needed
      "@typescript-eslint/no-unused-vars": "off", // or "warn"
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],
  },
  {
    files: ["public/sw.js"],
    languageOptions: {
      globals: {
        self: "readonly",
        caches: "readonly",
        fetch: "readonly",
        clients: "readonly",
        Response: "readonly",
        URL: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-undef": "error", // still enforce other undefs if any
    },
  },
);
