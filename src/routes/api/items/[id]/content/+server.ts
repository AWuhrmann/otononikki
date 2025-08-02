// GET full content of a specific item (for viewing/editing)
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET({ locals, params }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        const user_id = session.user.id;
        const item_id = params.id;

        const result = await pool.query(
            `SELECT id, name, type, content, external_url, link_description, created_at, updated_at
             FROM items 
             WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
            [item_id, user_id]
        );

        if (result.rows.length === 0) {
            throw error(404, 'Item not found');
        }

        return json(result.rows[0]);

    } catch (err) {
        console.error('Error fetching item content:', err);
        return json({ success: false }, { status: 500 });
    }
}