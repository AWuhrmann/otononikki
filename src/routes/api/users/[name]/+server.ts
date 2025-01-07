import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';
import { CardState } from '$lib/card.svelte.js';

export async function GET({ params }) {

    const { name } = params;

    const userResult = await pool.query(
        `SELECT u.*, u.username as username 
     FROM users u WHERE u.username = $1`,
        [name]
    );

    const user = userResult.rows[0];

    console.log(user);

    const cardsResults = await pool.query(
        `SELECT c.*,
  (SELECT ARRAY_AGG(cv.current_value) 
   FROM card_values cv 
   WHERE cv.card_id = c.id) as values,
  (SELECT ARRAY_AGG(cs.setting_name) 
   FROM card_settings cs 
   WHERE cs.card_id = c.id) as settings
FROM user_cards c
WHERE c.user_id = $1;`,  // Need to group by the card ID to aggregate values/settings`,
        [user.id]
    );

    const cards = cardsResults.rows;
    console.log(cards)

    const cardStates: CardState[] = cards.map(card => new CardState({
        id: card.id,
        title: card.title,
        description: card.description,
        createdBy: card.created_by,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
        name: card.name || '',
        settings: card.settings || {},
        values: card.values || [],
    }));

    user.cards = cardStates;


    return json({ ...user });
}