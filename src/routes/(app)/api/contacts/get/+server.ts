import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET({ locals, request, params }) {
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, 'Not authenticated');
  }

  try {
    // Parse the request body

    const user_id = session.user.id;
    // First check if we already have a value for today
    const contacts = await pool.query(
      `SELECT * 
       FROM contacts 
       WHERE user_id = $1`,
      [user_id]
    );

    const contactNames = contacts.rows.map(contact => contact.name);
    return json(contactNames);

  } catch (error) {
    console.error('Error managing card values:', error);
    return json({ 
      success: false, 
    }, { status: 500 });
  }
}