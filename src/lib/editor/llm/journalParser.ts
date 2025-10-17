import type { Task } from "$lib/types/editor";

/**
 * Extracts contacts and tasks from a journal entry using LLM
 * @param journalText - The journal entry text to parse
 * @returns Object containing arrays of contacts and task verbatims
 */
export async function extractContactsAndTasks(journalText: string): Promise<{
  contacts: string[];
  tasks: Task[];
}> {
  // Call our own API route (which proxies to the external API)
  const response = await fetch("/api/annotate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ journalText }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to analyze journal");
  }

  const data = await response.json();

  return {
    contacts: data.contacts,
    tasks: data.tasks,
  };
}
