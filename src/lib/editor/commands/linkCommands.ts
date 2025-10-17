import type { Task } from "$lib/types/editor";
import { parserCtx, editorViewCtx } from "@milkdown/kit/core";
import type { Editor } from "@milkdown/kit/core";

/**
 * Inserts markdown at the current cursor position in the editor.
 * @param editor - The editor instance.
 * @param markdown - The markdown string to insert.
 */
export function insertMarkdownAtCursor(
  editor: Editor,
  markdown: string,
  position?: number,
) {
  editor.action((ctx) => {
    const parser = ctx.get(parserCtx);
    const view = ctx.get(editorViewCtx);

    // Parse the markdown into ProseMirror document
    const doc = parser(markdown);

    // Get current editor state
    const { state } = view;

    // Use provided position or fall back to current selection
    const insertPos = position ?? state.selection.from;

    const content = doc.content.firstChild?.content || doc.content;

    // Create transaction to insert the parsed content
    const tr = state.tr.insert(insertPos, content);

    // Dispatch the transaction
    view.dispatch(tr);
  });
} 

export function insertMarkdownAfterPattern(
  editor: Editor,
  pattern: string | RegExp,
  markdown: string,
  replace: boolean = false,
) {
  editor.action((ctx) => {
    const parser = ctx.get(parserCtx);
    const view = ctx.get(editorViewCtx);
    const { state } = view;
    
    // Find the pattern in the document
    let foundPos: number | null = null;
    let patternLength: number = 0;
    
    state.doc.descendants((node, pos) => {
      // If we already found it, stop searching
      if (foundPos !== null) return false;
      
      // Check text nodes
      if (node.isText && node.text) {
        const match = typeof pattern === 'string' 
          ? node.text.indexOf(pattern)
          : node.text.match(pattern);
        
        if (match !== -1 && match !== null) {
          const matchIndex = typeof pattern === 'string' 
            ? match 
            : match.index!;
          patternLength = typeof pattern === 'string'
            ? pattern.length
            : match[0].length;
          
          // Position after the matched text
          foundPos = pos + matchIndex + patternLength;
          return false; // Stop searching
        }
      }
      return true; // Continue searching
    });
    
    if (foundPos === null) {
      console.warn('Pattern not found in document');
      return;
    }
    
    // Parse the markdown
    const doc = parser(markdown);
    const content = doc.content.firstChild?.content || doc.content;
    
    let tr = state.tr;
    
    if (replace) {
      // Find the end of the current line/block from foundPos
      const $pos = state.doc.resolve(foundPos);
      const endOfBlock = $pos.end();
      
      // Delete from after pattern to end of line, then insert new content
      tr = tr.delete(foundPos, endOfBlock).insert(foundPos, content);
    } else {
      // Just insert the content
      tr = tr.insert(foundPos, content);
    }
    
    view.dispatch(tr);
  });
}

export function getMarkdownAfterPattern(
  editor: Editor,
  pattern: string | RegExp,
): string | null {
  return editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    const { state } = view;
    
    // Find the pattern in the document
    let foundPos: number | null = null;
    
    state.doc.descendants((node, pos) => {
      // If we already found it, stop searching
      if (foundPos !== null) return false;
      
      // Check text nodes
      if (node.isText && node.text) {
        const match = typeof pattern === 'string' 
          ? node.text.indexOf(pattern)
          : node.text.match(pattern);
        
        if (match !== -1 && match !== null) {
          const matchIndex = typeof pattern === 'string' 
            ? match 
            : match.index!;
          const patternLength = typeof pattern === 'string'
            ? pattern.length
            : match[0].length;
          
          // Position after the matched text
          foundPos = pos + matchIndex + patternLength;
          return false; // Stop searching
        }
      }
      return true; // Continue searching
    });
    
    if (foundPos === null) {
      console.warn('Pattern not found in document');
      return null;
    }
    
    // Get the position info and find end of block
    const $pos = state.doc.resolve(foundPos);
    const endOfBlock = $pos.end();
    
    // Extract the text content from after pattern to end of line
    const textAfterPattern = state.doc.textBetween(
      foundPos,
      endOfBlock,
      '\n', // Separator for block boundaries
      '\n'  // Separator for leaf nodes
    );
    
    return textAfterPattern;
  });
}

/**
 * Appends markdown content to the end of the editor.
 * @param editor - The editor instance.
 * @param markdown - The markdown string to append.
 */
export function appendMarkdown(editor: any, markdown: string): void {
  const docEnd = editor.getDoc().lastLine();
  editor.replaceRange(`\n${markdown}`, {
    line: docEnd,
    ch: editor.getLine(docEnd).length,
  });
}

/**
 * Replaces text in the editor with clickable links based on a mapping.
 * @param editor - The editor instance.
 * @param linkMap - An object mapping text to URLs.
 */
export function replaceTextWithLinks(
  editor: any,
  linkMap: Record<string, string>,
): void {
  const content = editor.getValue();
  const updatedContent = Object.keys(linkMap).reduce((text, key) => {
    const url = linkMap[key];
    const linkMarkdown = `[${key}](${url})`;
    return text.replace(new RegExp(`\\b${key}\\b`, "g"), linkMarkdown);
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

/**
 * Converts the currently selected text into a contact link
 * @param editor - The editor instance
 * @param contactPath - Optional custom path, defaults to /contacts/{selectedText}.md
 */
export function convertSelectionToContactLink(
  editor: Editor,
  contactPath?: string,
) {
  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    const { state } = view;
    const { from, to } = state.selection;

    // Get the selected text
    const selectedText = state.doc.textBetween(from, to, " ");

    if (!selectedText) {
      console.warn("No text selected");
      return;
    }

    // Create the contact link path
    const path =
      contactPath ||
      `/contacts/${selectedText.toLowerCase().replace(/\s+/g, "-")}.md`;
    const linkMarkdown = `[${selectedText}](${path})`;

    // Parse the markdown link
    const parser = ctx.get(parserCtx);
    const doc = parser(linkMarkdown);

    // Replace the selection with the link
    const tr = state.tr.replaceWith(from, to, doc.content);
    view.dispatch(tr);
  });
} /**
 * Automatically converts specified names and task snippets to links throughout the document
 * @param editor - The editor instance
 * @param contacts - Array of contact names to convert (e.g., ["John", "Sarah"])
 * @param tasks - Array of task snippets to convert (e.g., ["Follow up with John", "Review the document"])
 */
export function autoLinkContent(
  editor: Editor,
  contacts: string[],
  tasks: Task[],
) {
  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    const { state } = view;

    // Create a list of all replacements with their positions
    const replacements: Array<{
      from: number;
      to: number;
      text: string;
      type: "task" | "contact";
      linkPath: string;
    }> = [];

    // Traverse the document to find all occurrences
    state.doc.descendants((node, pos) => {
      if (!node.isText || !node.text) return;

      const text = node.text;

      // Find all task occurrences in this text node (these take priority)
      tasks.forEach((taskText) => {
        let index = 0;
        while ((index = text.indexOf(taskText.verbatim, index)) !== -1) {
          replacements.push({
            from: pos + index,
            to: pos + index + taskText.verbatim.length,
            text: taskText.verbatim,
            type: "task",
            linkPath: `/tasks/${taskText.summary.toLowerCase().replace(/\s+/g, "-")}.md`,
          });
          index += taskText.verbatim.length;
        }
      });

      // Find all contact occurrences in this text node
      contacts.forEach((contactName) => {
        let index = 0;
        while ((index = text.indexOf(contactName, index)) !== -1) {
          const from = pos + index;
          const to = pos + index + contactName.length;

          // Check if this contact overlaps with any task
          const overlapsWithTask = replacements.some(
            (r) => r.type === "task" && !(to <= r.from || from >= r.to), // Check for overlap
          );

          if (!overlapsWithTask) {
            replacements.push({
              from,
              to,
              text: contactName,
              type: "contact",
              linkPath: `/contacts/${contactName.toLowerCase().replace(/\s+/g, "-")}.md`,
            });
          }

          index += contactName.length;
        }
      });
    });

    // Sort replacements by position (reverse order so we can apply from end to start)
    replacements.sort((a, b) => b.from - a.from);

    // Apply all replacements by adding link marks
    let tr = state.tr;

    replacements.forEach((replacement) => {
      // Create a link mark (not a full document)
      const linkMark = state.schema.marks.link.create({
        href: replacement.linkPath,
        linkType: replacement.type,
      });

      // Add the link mark to the text range
      tr = tr.addMark(replacement.from, replacement.to, linkMark);
    });

    // Dispatch the transaction
    view.dispatch(tr);
  });
}

