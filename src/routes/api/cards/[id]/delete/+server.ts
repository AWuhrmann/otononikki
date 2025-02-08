import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function POST({ locals, request, params }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        // Parse the request body
        const { card_id } = await request.json();
        console.log('Received values:', {
            cardId: card_id,
        });

        const user_id = session.user.id;
        console.log('User ID:', user_id);

        console.log("Card ID type:", typeof card_id, "Value:", card_id);

        const existingValue = await pool.query(
            `SELECT id FROM cards WHERE id = $1`,
            [Number(card_id)]
        );


        if (existingValue.rows.length > 0) {
            // If value exists for today, delete it
            console.log('deleting value')


            await pool.query(
                `DELETE FROM card_settings 
                 WHERE card_id = $1`,
                [Number(card_id)]
            );

            await pool.query(
                `DELETE FROM card_values 
                 WHERE card_id = $1`,
                [Number(card_id)]
            );

            await pool.query(
                `DELETE FROM cards 
         WHERE id = $1`,
                [Number(card_id)]
            );
        }

        return json({ success: true, action: 'inserted' });


    } catch (error) {
        console.error('Error managing card values:', error);
        return json({
            success: false,
        }, { status: 500 });
    }
}