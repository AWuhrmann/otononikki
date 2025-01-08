import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET({ params }) {

    console.log('test');

    return json({ success: true });

}