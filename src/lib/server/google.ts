import { google } from "googleapis" 
import { GOOGLE_CALENDAR_API_CLIENT_SECRET, GOOGLE_CALENDAR_API_CLIENT_ID } from "$env/static/private"
import { pool } from "./db"
import { type Credentials } from "google-auth-library";
import { stringify } from "querystring";
import { json } from "@sveltejs/kit";

export const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CALENDAR_API_CLIENT_ID,
    GOOGLE_CALENDAR_API_CLIENT_SECRET,
    "http://localhost:3000/callback"
)

oauth2Client.getToken

export async function getUserTokens(userId: number): Promise<Credentials> { 
    const res = await pool.query(`
        SELECT access_token, refresh_token, token_expiry, scope, token_type FROM user_tokens WHERE user_id = $1
      `, [
        userId
      ]);

    const data = res.rows[0];

    const {access_token, refresh_token, token_expiry, scope, token_type} = data;

    const credentials: Credentials = { 
        access_token: access_token,
        refresh_token: refresh_token,
        scope: scope,
        token_type: token_type,
        expiry_date: new Date(data.token_expiry).getTime()
    }
    
    if (new Date(data.token_expiry).getTime() > Date.now()) {
        await refreshTokens(userId, credentials)
    }
    return credentials
}

async function refreshTokens(userId: number, tokens: Credentials) {
    oauth2Client.setCredentials(tokens) 
    const res = await oauth2Client.refreshAccessToken();
    await saveUserTokens(userId, res.credentials)
}

export async function saveUserTokens(userId: number, tokens: Credentials) { 
  await pool.query(`
    INSERT INTO user_tokens (user_id, access_token, refresh_token, token_expiry, scope, token_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      token_expiry = EXCLUDED.token_expiry,
      scope = EXCLUDED.scope,
      updated_at = CURRENT_TIMESTAMP,
      token_type = EXCLUDED.token_type
  `, [
    userId,
    tokens.access_token,
    tokens.refresh_token,
    tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    tokens.scope,
    tokens.token_type,
  ]);
}