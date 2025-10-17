// 2. FUNCTION TO APPLY HIGHLIGHTS PROGRAMMATICALLY
import { editorViewCtx } from "@milkdown/kit/core";
import type { Editor } from "@milkdown/kit/core";
import { highlightSchema } from "./highlight-plugin";

/**
 * Find all occurrences of a text snippet in the document and apply highlight marks
 */
export function applyHighlights(
  editor: Editor,
  snippets: string[],
  analysisId?: string,
) {
  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    const { state } = view;
    const { doc, tr } = state;

    // Get the highlight mark type
    const highlightMarkType = highlightSchema.type(ctx);

    // Track if we made any changes
    let modified = false;

    // For each snippet the LLM returned
    snippets.forEach((snippet) => {
      if (!snippet || snippet.length === 0) return;

      // Traverse the document to find matching text
      doc.descendants((node, pos) => {
        // Only process text nodes
        if (!node.isText) return;

        const text = node.text || "";
        let searchPos = 0;

        // Find all occurrences of the snippet in this text node
        while (searchPos < text.length) {
          const index = text.indexOf(snippet, searchPos);
          if (index === -1) break;

          // Calculate absolute positions in the document
          const from = pos + index;
          const to = from + snippet.length;

          // Check if this range already has a highlight
          const hasHighlight = doc.rangeHasMark(from, to, highlightMarkType);

          if (!hasHighlight) {
            // Apply the highlight mark
            tr.addMark(from, to, highlightMarkType.create({ id: analysisId }));
            modified = true;
          }

          // Move search position forward
          searchPos = index + snippet.length;
        }
      });
    });

    // Dispatch the transaction if we made changes
    if (modified) {
      view.dispatch(tr);
    }
  });
}

/**
 * Remove all highlights from the document
 */
export function clearHighlights(editor: Editor) {
  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    const { state } = view;
    const { doc, tr } = state;

    const highlightMarkType = highlightSchema.type(ctx);

    // Remove all highlight marks from the entire document
    tr.removeMark(0, doc.content.size, highlightMarkType);

    view.dispatch(tr);
  });
}

/**
 * Remove highlights for a specific analysis ID
 */
export function clearHighlightsByAnalysis(editor: Editor, analysisId: string) {
  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    const { state } = view;
    const { doc, tr } = state;

    const highlightMarkType = highlightSchema.type(ctx);
    let modified = false;

    doc.descendants((node, pos) => {
      if (!node.isText) return;

      node.marks.forEach((mark) => {
        if (mark.type === highlightMarkType && mark.attrs.id === analysisId) {
          tr.removeMark(pos, pos + node.nodeSize, mark);
          modified = true;
        }
      });
    });

    if (modified) {
      view.dispatch(tr);
    }
  });
}
