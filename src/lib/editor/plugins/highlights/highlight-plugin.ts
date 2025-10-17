// 1. DEFINE THE HIGHLIGHT MARK SCHEMA
import { $markSchema } from "@milkdown/kit/utils";

export const highlightSchema = $markSchema("highlight", () => ({
  attrs: {
    id: { default: null }, // Optional: track which LLM analysis this came from
  },
  parseDOM: [
    {
      tag: "mark.llm-highlight",
      getAttrs: (node: HTMLElement) => ({
        id: node.getAttribute("data-id"),
      }),
    },
  ],
  toDOM: (mark) => [
    "mark",
    {
      class: "llm-highlight",
      "data-id": mark.attrs.id,
      // Inline bubble styling
      style: `
        background-color: rgba(255, 235, 59, 0.3);
        padding: 2px 6px;
        border-radius: 12px;
        border: 1px solid rgba(255, 235, 59, 0.6);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      `
        .replace(/\s+/g, " ")
        .trim(),
    },
  ],
  // ✅ REMOVED: No markdown serialization needed
  // Highlights are ephemeral UI decorations, not part of the document structure
}));

// Export the plugin (just the schema, no input rules needed)
export const highlightPlugin = highlightSchema;
