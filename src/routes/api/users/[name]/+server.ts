import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';
import { CardState } from '$lib/card.svelte.js';

export async function GET({ params }) {

    console.log('test');

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
            ARRAY_AGG(cv.current_value) as values,
            ARRAY_AGG(cs.setting_name) as settings
     FROM user_cards c
     LEFT JOIN card_values cv ON c.id = cv.id 
     LEFT JOIN card_settings cs ON c.id = cs.id
     WHERE c.user_id = $1
        GROUP BY c.id`,  // Need to group by the card ID to aggregate values/settings`,
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

    console.log(user)

    console.log(user.cards[0].values)

    return json({ ...user });
}