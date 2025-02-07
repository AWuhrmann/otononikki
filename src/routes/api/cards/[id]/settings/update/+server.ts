import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function POST({ locals, request, params }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        // Parse the request body
        const { user_id, card_id, setting_name, setting_value } = await request.json();
        console.log('Changing settings with Received values:', {
            userId: user_id,
            cardId: card_id,
            settingName: setting_name,
            settingValue: setting_value
        });

        const card_id_n = Number(card_id);

        const existingValue = await pool.query(
            `SELECT id FROM cards WHERE id = $1`,
            [Number(card_id)]
        );

        if (existingValue.rowCount === 0) {
            throw error(404, 'Card not found');
        }
        if (setting_name === 'name') {
            const result = await pool.query(
            `UPDATE cards
             SET name = $3
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [Number(card_id), user_id, setting_value]
            );
        } else {
            const result = await pool.query(
            `UPDATE card_settings
             SET value = $3
             WHERE card_id = $1 AND name = $2
             RETURNING *`,
            [Number(card_id), setting_name, setting_value]
            );
        }

        return json({ success: true, action: 'updated' });


    } catch (error) {
        console.error('Error managing card values:', error);
        return json({
            success: false,
        }, { status: 500 });
    }
}