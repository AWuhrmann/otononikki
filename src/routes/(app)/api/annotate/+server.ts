// src/routes/api/transcribe/+server.ts
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { writeFileSync, createReadStream, unlinkSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import { INFOMANIAK_API_KEY, INFOMANIAK_PRODUCT_ID } from "$env/static/private";

interface LLMTask {
  verbatim: string;
  summary: string;
  date: string;
}
interface LLMResponse {
  contacts: string[];
  tasks: LLMTask[];
}

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { journalText } = await request.json();

    if (!journalText) {
      return json({ error: "No journal text provided" }, { status: 400 });
    }

    // Placeholder prompts - fill these with your actual content
    const systemPrompt = `You are a helpful assistant that extracts contacts and pending tasks from journal entries.

    Each journal entry will start with a date in the format "YYYY-MM-DD" on the first line.

    CONTACTS: Extract names or relationship terms (like "mom", "the investor") exactly as they appear in the text.

    TASKS: Extract only future/pending tasks (not completed ones). For each task provide:
    1. verbatim: The exact snippet mentioning the task
    2. summary: A brief action-oriented summary
    3. date: The exact date to perform the task in YYYY-MM-DD format. Calculate based on:
       - Relative time references (e.g., "tomorrow" = journal date + 1 day)
       - Specific dates mentioned (convert to YYYY-MM-DD)
       - Events with known dates (e.g., Christmas = December 25)
       - For events missing crucial info (like unknown birthdays), use "NEEDS_DATE"
       - For time-sensitive prep tasks (like buying gifts), set date appropriately before the event

    Return your response as a JSON object with "contacts" and "tasks" arrays.`;

    const examples: Array<{ user: string; assistant: string }> = [
      {
        user: `2025-10-11

    Had standup this morning and need to follow up with Sarah Chen about those API authentication concerns before sprint planning. The lunch meeting with the investor went okay but he wants to see our retention numbers up by 15% before he'll commit to the Series A. Spent most of the afternoon tracking down that memory leak and finally got it sorted. Evening plans fell through so I just grabbed takeout and relaxed—probably should've hit the gym but whatever. Didn't get around to finishing that budget spreadsheet or calling mom for her birthday, so I'll definitely do both tomorrow.`,
        assistant: `{
  "contacts": ["Sarah Chen", "the investor", "mom"],
  "tasks": [
    {
      "verbatim": "need to follow up with Sarah Chen about those API authentication concerns before sprint planning",
      "summary": "Follow up with Sarah Chen on API authentication",
      "date": "2025-10-13"
    },
    {
      "verbatim": "finishing that budget spreadsheet",
      "summary": "Finish budget spreadsheet",
      "date": "2025-10-12"
    },
    {
      "verbatim": "calling mom for her birthday",
      "summary": "Call mom for birthday",
      "date": "NEEDS_DATE"
    }
  ]
}`,
      },
      {
        user: `2025-10-11

    Morning coffee with Marcus went longer than expected but we finally nailed down the marketing strategy for the product launch. Spent the rest of the day in back-to-back client calls—the presentation for the Chicago pitch needs work but I think we're headed in the right direction. Got home late and realized I completely forgot to pick up my prescription from the pharmacy, and I still haven't responded to that recruiter on LinkedIn about the consulting gig. Guess I'll handle both of those tomorrow morning before the team offsite.`,
        assistant: `{
  "contacts": ["Marcus", "that recruiter"],
  "tasks": [
    {
      "verbatim": "pick up my prescription from the pharmacy",
      "summary": "Pick up prescription from pharmacy",
      "date": "2025-10-12"
    },
    {
      "verbatim": "responded to that recruiter on LinkedIn about the consulting gig",
      "summary": "Respond to recruiter on LinkedIn about consulting gig",
      "date": "2025-10-12"
    }
  ]
}`,
      },
      {
        user: `2025-11-15

    Quick check-in with Dr. Patel this afternoon—she wants me to schedule the follow-up MRI within the next two weeks. My brother called asking if I could help him move on the 25th, told him I'd confirm by Friday. Still need to book flights for the conference in March and get Jamie a gift before his retirement party on December 10th. The presentation yesterday went great, glad that's behind me.`,
        assistant: `{
  "contacts": ["Dr. Patel", "My brother", "Jamie"],
  "tasks": [
    {
      "verbatim": "schedule the follow-up MRI within the next two weeks",
      "summary": "Schedule follow-up MRI",
      "date": "2025-11-29"
    },
    {
      "verbatim": "confirm by Friday",
      "summary": "Confirm with brother about helping him move",
      "date": "2025-11-22"
    },
    {
      "verbatim": "help him move on the 25th",
      "summary": "Help brother move",
      "date": "2025-11-25"
    },
    {
      "verbatim": "book flights for the conference in March",
      "summary": "Book flights for March conference",
      "date": "2026-02-15"
    },
    {
      "verbatim": "get Jamie a gift before his retirement party on December 10th",
      "summary": "Get gift for Jamie's retirement party",
      "date": "2025-12-03"
    }
  ]
}`,
      },
      {
        user: `2025-10-10

This is just a test message lolol.`,
        assistant: `{
"contacts": [],
"tasks": []
}`,
      },
    ];

    // Build the messages array
    const messages: LLMMessage[] = [{ role: "system", content: systemPrompt }];

    // Add examples
    examples.forEach((example) => {
      messages.push({ role: "user", content: example.user });
      messages.push({ role: "assistant", content: example.assistant });
    });

    // Add the actual journal entry to parse
    messages.push({ role: "user", content: journalText });

    // Make the API request
    const response = await fetch(
      "https://api.infomaniak.com/1/ai/104938/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${INFOMANIAK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          model: "mistral3",
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`LLM API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    const content = data.choices[0].message.content;

    console.log(content);

    // Parse the JSON response
    const parsed: LLMResponse = JSON.parse(content);

    // Extract just the verbatim text from tasks

    return json({
      contacts: parsed.contacts,
      tasks: parsed.tasks,
    });
  } catch (error) {
    console.error("Error processing journal:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
};

