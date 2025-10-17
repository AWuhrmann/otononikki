import { oauth2Client } from "$lib/server/google"
import { redirect } from "@sveltejs/kit"

export async function GET() {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        prompt: 'consent'
    }
    )
    redirect(302, authUrl)
}