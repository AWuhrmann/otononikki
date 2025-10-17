import { oauth2Client, saveUserTokens } from '$lib/server/google';
import type { RequestHandler } from './$types';
import { redirect, json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
    const session = await locals.getSession();
    
    if (session.user === null) {
      return json({ success: false, error: 'User not existent...' }, { status: 401 });
    }
    
    const code = url.searchParams.get('code');
    
    if (!code) {
      throw redirect(302, '/notes?error=no_code');
    }
    
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log('Got token:', tokens);
      
      const user_id = session.user.id;
      await saveUserTokens(user_id, tokens);
      console.log('Tokens saved successfully!');
      
    } catch (err) {
      console.log('ERROR occurred:', err);
      throw redirect(302, '/notes?error=auth_failed');
    }
    
    throw redirect(302, '/notes?calendar_connected=true');
  };