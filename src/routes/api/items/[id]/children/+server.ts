// GET children of a specific folder (for lazy loading)
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET({ locals, params }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        const user_id = session.user.id;
        const parent_id = params.id;

        // Verify parent folder exists and belongs to user
        const parentCheck = await pool.query(
            'SELECT id FROM items WHERE id = $1 AND user_id = $2 AND type = $3 AND deleted_at IS NULL',
            [parent_id, user_id, 'folder']
        );
        
        if (parentCheck.rows.length === 0) {
            throw error(404, 'Parent folder not found');
        }

        const result = await pool.query(
            `SELECT id, name, type, created_at, updated_at,
                    CASE WHEN type = 'folder' THEN 
                        EXISTS(SELECT 1 FROM items c WHERE c.parent_id = items.id AND c.deleted_at IS NULL)
                    ELSE false END as has_children
             FROM items 
             WHERE user_id = $1 AND parent_id = $2 AND deleted_at IS NULL
             ORDER BY type DESC, sort_order ASC, name ASC`,
            [user_id, parent_id]
        );

        const children = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            hasChildren: row.has_children
        }));

        return json(children);

    } catch (err) {
        console.error('Error fetching children:', err);
        return json({ success: false }, { status: 500 });
    }
}