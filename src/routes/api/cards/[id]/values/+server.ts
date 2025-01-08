import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function POST({ locals, request, params }) {
  
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, 'Not authenticated');
  }
  try {
    // Parse the request body
    const { user_id, value, card_id } = await request.json();
    
    console.log('Received values:', {
      userId: user_id,
      cardId: card_id,
      values: value
    });

    const userResult = await pool.query(
      `INSERT INTO card_values (card_id, current_value) VALUES ($1, $2)`,
      [card_id, value]
  );

    return json({ success: true });
  } catch (error) {
    console.error('Error saving card values:', error);
  }
}