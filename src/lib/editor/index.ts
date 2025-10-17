import type { Editor } from "@milkdown/kit/core";

export interface EditorAPI {
  highlightSnippets: (snippets: string[]) => void;
  convertToContactLink: () => void;
  autoLink: (contacts: string[], tasks: string[]) => void;
  clearHighlights: () => void;
  autoLinkFromLLM: () => void;
  insertMarkdown: (markdown: string) => void;
  insertMarkdownAfterPattern: (pattern: string | RegExp, markdown: string, replace: boolean) => void;
  getMarkdownAfterPattern: (pattern: string | RegExp) => void;
  getMarkdown: () => string;
}
