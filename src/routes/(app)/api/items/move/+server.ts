// MOVE item to different parent folder
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function POST({ locals, request }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        const { item_id, new_parent_id } = await request.json();
        const user_id = session.user.id;

        // Verify item exists and belongs to user
        const itemCheck = await pool.query(
            'SELECT type FROM items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [item_id, user_id]
        );
        
        if (itemCheck.rows.length === 0) {
            throw error(404, 'Item not found');
        }

        // Verify new parent exists and belongs to user (if not null)
        if (new_parent_id) {
            const parentCheck = await pool.query(
                'SELECT id FROM items WHERE id = $1 AND user_id = $2 AND type = $3 AND deleted_at IS NULL',
                [new_parent_id, user_id, 'folder']
            );
            if (parentCheck.rows.length === 0) {
                throw error(400, 'Invalid destination folder');
            }

            // Prevent moving folder into itself or its descendants
            const cyclicCheck = await pool.query(`
                WITH RECURSIVE folder_tree AS (
                    SELECT id, parent_id FROM items WHERE id = $1 AND user_id = $3
                    UNION ALL
                    SELECT i.id, i.parent_id FROM items i
                    INNER JOIN folder_tree ft ON i.parent_id = ft.id
                    WHERE i.user_id = $3 AND i.deleted_at IS NULL
                )
                SELECT 1 FROM folder_tree WHERE id = $2
            `, [item_id, new_parent_id, user_id]);

            if (cyclicCheck.rows.length > 0) {
                throw error(400, 'Cannot move folder into itself or its descendants');
            }
        }

        // Get next sort order in destination
        const sortResult = await pool.query(
            'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM items WHERE user_id = $1 AND parent_id = $2 AND deleted_at IS NULL',
            [user_id, new_parent_id]
        );
        const sort_order = sortResult.rows[0].next_order;

        await pool.query(
            'UPDATE items SET parent_id = $1, sort_order = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4',
            [new_parent_id, sort_order, item_id, user_id]
        );

        return json({ success: true });

    } catch (err: any) {
        console.error('Error moving item:', err);
        return json({ success: false, error: err.message }, { status: 500 });
    }
}