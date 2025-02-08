import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function POST({ locals, request, params }) {
    console.log('received request');

    const session = await locals.getSession()

    if (!session?.user){
        throw error(401, "User not authenticated") 
    }

    const id = session.user.id;

    let data = await request.json();

    console.log(data);

    const row = await pool.query('INSERT INTO cards (name, user_id) VALUES ($1, $2) RETURNING id', [data.name, id])

    const card_id = row.rows[0].id;

    pool.query('INSERT INTO card_settings (name, value, card_id) VALUES ($1, $2, $3)', ['color', data.color, card_id]);
    
    pool.query('INSERT INTO card_settings (name, value, card_id) VALUES ($1, $2, $3)', ['type', data.type, card_id]);


    data.settings.forEach(setting => {
        pool.query('INSERT INTO card_settings (name, value, card_id) VALUES ($1, $2, $3)', [setting.label, setting.value, card_id]);
    });

    return json({ success: true });
}