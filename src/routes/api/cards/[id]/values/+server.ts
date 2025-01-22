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

    // First check if we already have a value for today
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    const existingValue = await pool.query(
      `SELECT id 
       FROM card_values 
       WHERE card_id = $1 
       AND DATE(updated_at) = DATE($2)`,
      [card_id, today]
    );

    console.log(existingValue);

    if (existingValue.rows.length > 0) {
      // If value exists for today, delete it
      console.log('deleting value')
      await pool.query(
        `DELETE FROM card_values 
         WHERE card_id = $1 
         AND DATE(updated_at) = DATE($2)`,
        [card_id, today]
      );
    } 
    // If no value exists for today, insert new one
    await pool.query(
      `INSERT INTO card_values (card_id, value) 
        VALUES ($1, $2)`,
      [card_id, value]
    );
    
    return json({ success: true, action: 'inserted' });
  

  } catch (error) {
    console.error('Error managing card values:', error);
    return json({ 
      success: false, 
    }, { status: 500 });
  }
}