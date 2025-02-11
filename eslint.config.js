import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";

export default [
  {
    ignores: ["node_modules/", "dist/"],
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
        ecmaVersion: "latest",
        extraFileExtensions: [".svelte"],
      },
    },
    plugins: { svelte },
    rules: {
      "svelte/first-attribute-linebreak": "off",
    },
  },
];
