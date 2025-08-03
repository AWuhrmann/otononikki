// src/routes/api/transcribe/+server.ts
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFileSync, createReadStream, unlinkSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { INFOMANIAK_API_KEY, INFOMANIAK_PRODUCT_ID } from '$env/static/private';

export const POST: RequestHandler = async ({ request }: { request: Request }) => {

    try {
        // Should first check if the user has still tokens credits

        const req = await request.json();

        console.log(req);

        const text = req.text;

        if (text.trim() === '') {
            return json({ annotation: "" })
        }

        const response = await fetch(`https://api.infomaniak.com/1/ai/${INFOMANIAK_PRODUCT_ID}/openai/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": ` Bearer ${INFOMANIAK_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "messages": [
                    {
                      "role": "system",
                      "content": "You are a helpful assistant that extracts structured data from user notes. Your job is to analyze notes and return a JSON object with:\n\n1. \"contacts\": a list of people or roles mentioned (like \"Clara\", \"my manager\", \"her boyfriend\")\n2. \"tasks\": a list of things the user needs or plans to do.\n\nEach task must be an object with:\n- \"text\": the exact span of text used in the note\n- \"description\": a brief explanation of what the task involves\n\nOnly return items that are explicitly mentioned in the note. The output must be valid JSON."
                    },
                    {
                      "role": "user",
                      "content": "I should message Alex to ask if he confirmed the trip. Also remind my supervisor about the meeting notes, and maybe ask Laura if she’s still joining us."
                    },
                    {
                      "role": "assistant",
                      "content": `{
                    "contacts": ["Alex", "my supervisor", "Laura"],
                    "tasks": [
                      {
                        "text": "message Alex to ask if he confirmed the trip",
                        "description": "Send a message to Alex to check if he confirmed the trip"
                      },
                      {
                        "text": "remind my supervisor about the meeting notes",
                        "description": "Remind your supervisor to look at or send the meeting notes"
                      },
                      {
                        "text": "ask Laura if she’s still joining us",
                        "description": "Check with Laura to see if she is still coming"
                      }
                    ]
                  }`
                    },
                    {
                      "role": "user",
                      "content": `${text}`
                    }
                  ],
                "model": "mistral24b",
            })
        });

        const res = await response.json();

        if (res.result === 'error') {
            console.log(res.error.errors);
        }


        return json({
            annotation: res.choices[0].message
        })

    } catch (err) {

        console.error('Annotation error:', err);
        throw error(500, 'Failed to process annotation request');
    }
};