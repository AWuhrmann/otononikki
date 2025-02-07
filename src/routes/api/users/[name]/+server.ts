import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';
import { CardState, type CardSettings } from '$lib/card.svelte.js';

export async function GET({ params }) {

    const { name } = params;

    const userResult = await pool.query(
        `SELECT u.*, u.name as username 
     FROM users u WHERE u.name = $1`,
        [name]
    );

    const user = userResult.rows[0];
    console.log(user)

    const cardsResults = await pool.query(
        `SELECT c.*,
    ARRAY_AGG(
        CASE 
            WHEN cv.id IS NOT NULL 
            THEN json_build_object('value', cv.value, 'timestamp', cv.updated_at)
        END ORDER BY cv.updated_at ASC
    ) FILTER (WHERE cv.id IS NOT NULL) as values,
    ARRAY_AGG(
        CASE 
            WHEN cs.id IS NOT NULL 
            THEN json_build_object('name', cs.name, 'value', cs.value)
        END
    ) FILTER (WHERE cs.id IS NOT NULL) as settings
FROM cards c
LEFT JOIN card_values cv ON cv.card_id = c.id
LEFT JOIN card_settings cs ON cs.card_id = c.id
WHERE c.user_id = $1
GROUP BY c.id, c.user_id;`,  // Need to group by the card ID to aggregate values/settings`,
        [user.id]
    );

    const cards = cardsResults.rows;

    const cardStates: CardState[] = cards.map(card => new CardState({
        userId: card.user_id,
        id: card.id,
        title: card.title,
        description: card.description,
        createdBy: card.created_by,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
        name: card.name || '',
        settings: card.settings?.reduce((acc, item) => {
            acc[item.name] = item.value;
            return acc;
          }, {} as Record<string, number>) || {},
        values: card.values?.map(v => ({
            value: v.value,
            timestamp: new Date(v.timestamp)
          })) || [],
    }));

    user.cards = cardStates;

    return json({ ...user });
}