// GET full path of a specific item
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

        // Verify item exists and belongs to user
        const itemCheck = await pool.query(
            'SELECT id FROM items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [item_id, user_id]
        );

        if (itemCheck.rows.length === 0) {
            throw error(404, 'Item not found');
        }

        // Recursive query to construct the full path
        const pathQuery = `
            WITH RECURSIVE path_cte AS (
                SELECT id, name, parent_id
                FROM items
                WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
                UNION ALL
                SELECT i.id, i.name, i.parent_id
                FROM items i
                INNER JOIN path_cte p ON i.id = p.parent_id
                WHERE i.user_id = $2 AND i.deleted_at IS NULL
            )
            SELECT name FROM path_cte ORDER BY parent_id NULLS FIRST;
        `;

        const pathResult = await pool.query(pathQuery, [item_id, user_id]);

        const fullPath = pathResult.rows.map(row => row.name).join('/');

        return json({ path: fullPath });

    } catch (err) {
        console.error('Error fetching path:', err);
        return json({ success: false }, { status: 500 });
    }
}