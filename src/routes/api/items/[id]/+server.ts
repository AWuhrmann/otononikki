// UPDATE and DELETE specific item
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function PUT({ locals, request, params }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        const { name, content, external_url, link_description } = await request.json();
        const user_id = session.user.id;
        const item_id = params.id;

        if (!name) {
            throw error(400, 'Name is required');
        }

        // Verify item exists and belongs to user
        const itemCheck = await pool.query(
            'SELECT type FROM items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [item_id, user_id]
        );
        
        if (itemCheck.rows.length === 0) {
            throw error(404, 'Item not found');
        }

        const itemType = itemCheck.rows[0].type;

        const result = await pool.query(
            `UPDATE items 
             SET name = $1, content = $2, external_url = $3, link_description = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 AND user_id = $6
             RETURNING id, name, type, updated_at`,
            [
                name, 
                itemType === 'file' ? content : null,
                itemType === 'link' ? external_url : null,
                itemType === 'link' ? link_description : null,
                item_id, 
                user_id
            ]
        );

        return json({
            success: true,
            item: result.rows[0]
        });

    } catch (err: any) {
        console.error('Error updating item:', err);
        return json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE({ locals, params }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        const user_id = session.user.id;
        const item_id = params.id;

        // Verify item exists and belongs to user
        const itemCheck = await pool.query(
            'SELECT type FROM items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [item_id, user_id]
        );
        
        if (itemCheck.rows.length === 0) {
            throw error(404, 'Item not found');
        }

        const itemType = itemCheck.rows[0].type;

        if (itemType === 'folder') {
            // Recursive soft delete for folder and all its contents
            await pool.query(`
                WITH RECURSIVE folder_tree AS (
                    SELECT id FROM items WHERE id = $1 AND user_id = $2
                    UNION ALL
                    SELECT i.id FROM items i
                    INNER JOIN folder_tree ft ON i.parent_id = ft.id
                    WHERE i.user_id = $2 AND i.deleted_at IS NULL
                )
                UPDATE items SET deleted_at = CURRENT_TIMESTAMP 
                WHERE id IN (SELECT id FROM folder_tree) AND user_id = $2
            `, [item_id, user_id]);
        } else {
            // Simple soft delete for files and links
            await pool.query(
                'UPDATE items SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
                [item_id, user_id]
            );
        }

        return json({ success: true });

    } catch (err) {
        console.error('Error deleting item:', err);
        return json({ success: false }, { status: 500 });
    }
}