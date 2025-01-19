import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function POST({ locals, request, params }) {
    console.log('received request');

    let data = await request.json();

    console.log(data);


    return json({ success: true });
}