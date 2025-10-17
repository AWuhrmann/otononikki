import { extractContactsAndTasks } from "../llm/journalParser.js";
import { autoLinkContent } from "./linkCommands.js";
import type { Editor } from "@milkdown/kit/core";
import { editorViewCtx } from "@milkdown/kit/core";

/**
 * Analyzes the current editor content with LLM and auto-links contacts and tasks
 * @param editor - The editor instance
 */
export async function autoLinkFromLLM(editor: Editor): Promise<void> {
  // Get the current editor content
  let currentText = "";
  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    currentText = view.state.doc.textContent;
  });

  if (!currentText.trim()) {
    console.warn("No content to analyze");
    return;
  }

  try {
    // Call LLM to extract contacts and tasks
    const { contacts, tasks } = await extractContactsAndTasks(currentText);

    console.log("Extracted contacts:", contacts);
    console.log("Extracted tasks:", tasks);

    // Apply auto-linking with the extracted data
    autoLinkContent(editor, contacts, tasks);
  } catch (error) {
    console.error("Error during LLM extraction:", error);
    throw error;
  }
}

export async function ConnectToCalendar() { 
  window.location.href = '/api/auth/google';
}

export async function addTaskToCalendar() {
  // When pressed, add the following task to the calendar.

  let response = await fetch(`/api/calendar/add-task`, {
  method: "POST",
  body: JSON.stringify({}),
  headers: {
    "Content-type": "application/json; charset=UTF-8",
  },
});
}