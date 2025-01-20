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

    pool.query('INSERT INTO cards (name, user_id) VALUES ($1, $2)', [data.name, id])

    return json({ success: true });
}