
import { parserCtx, editorViewCtx } from "@milkdown/kit/core";
import type { Editor } from "@milkdown/kit/core";

/**
 * Inserts markdown at the current cursor position in the editor.
 * @param editor - The editor instance.
 * @param markdown - The markdown string to insert.
 */
export function insertMarkdownAtCursor(editor: Editor, markdown: string, position?: number) {
    editor.action((ctx) => {
      const parser = ctx.get(parserCtx);
      const view = ctx.get(editorViewCtx);
      
      // Parse the markdown into ProseMirror document
      const doc = parser(markdown);
      
      // Get current editor state
      const { state } = view;
      
      // Use provided position or fall back to current selection
      const insertPos = position ?? state.selection.from;
      
      // Create transaction to insert the parsed content
      const tr = state.tr.insert(insertPos, doc.content);
      
      // Dispatch the transaction
      view.dispatch(tr);
    });
  }/**
 * Appends markdown content to the end of the editor.
 * @param editor - The editor instance.
 * @param markdown - The markdown string to append.
 */
export function appendMarkdown(editor: any, markdown: string): void {
    const docEnd = editor.getDoc().lastLine();
    editor.replaceRange(`\n${markdown}`, { line: docEnd, ch: editor.getLine(docEnd).length });
}

/**
 * Replaces text in the editor with clickable links based on a mapping.
 * @param editor - The editor instance.
 * @param linkMap - An object mapping text to URLs.
 */
export function replaceTextWithLinks(editor: any, linkMap: Record<string, string>): void {
    const content = editor.getValue();
    const updatedContent = Object.keys(linkMap).reduce((text, key) => {
        const url = linkMap[key];
        const linkMarkdown = `[${key}](${url})`;
        return text.replace(new RegExp(`\\b${key}\\b`, 'g'), linkMarkdown);
    }, content);
    editor.setValue(updatedContent);
}

/**
 * Creates a smart link object with a label and URL.
 * @param label - The label for the link.
 * @param url - The URL for the link.
 * @returns A SmartLinkType object.
 */
export function createSmartLink(label: string, url: string): SmartLinkType {
    return { label, url };
}

/**
 * Type definition for a smart link object.
 */
export type SmartLinkType = {
    label: string;
    url: string;
};