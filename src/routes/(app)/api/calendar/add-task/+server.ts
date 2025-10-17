import { getUserTokens, oauth2Client, saveUserTokens } from '$lib/server/google.js';
import {error, redirect, json} from '@sveltejs/kit'
import { google } from 'googleapis';

export async function POST({request, locals, params}) { 

    const session = await locals.getSession()
    if (!session?.user) {
        throw error(401, "User not authenticated");
    }

    const user_id = session.user.id;
    
    const tokens = await getUserTokens(user_id)
    console.log('tok', tokens)
    oauth2Client.setCredentials(tokens);

    try {
        
        const calendar = google.calendar({version: 'v3', auth: oauth2Client})
        
        const event = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
              summary: "Quick test lmao",
              description: "Again...",
              start: {
                dateTime: "2025-10-15T10:30:00", // ISO 8601 format
                timeZone: 'America/Los_Angeles',
              },
              end: {
                dateTime: "2025-10-15T11:00:00",
                timeZone: 'America/Los_Angeles',
              },
              reminders: {
                useDefault: false,
                overrides: [
                  { method: 'email', minutes: 24 * 60 },
                  { method: 'popup', minutes: 10 }
                ]
              }
            }
          });
          
          return json({ success: true, eventId: event.data.id });
          
        } catch (error) {
          if (error.code === 401) {
            // Token expired, refresh it
            const newTokens = await oauth2Client.refreshAccessToken();
            await saveUserTokens(user_id, newTokens.credentials);
            // Retry the request
          }
            return json({success: false, error: error.message }, {status: 500});
        }
      

    return json({success: true})

}