// CREATE new item (file, folder, or link)
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function POST({ locals, request }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        const { name, type, parent_id, content, external_url, link_description } = await request.json();
        const user_id = session.user.id;

        // Validate required fields
        if (!name || !type || !['folder', 'file', 'link'].includes(type)) {
            throw error(400, 'Invalid name or type');
        }

        // Type-specific validation
        if (type === 'file' && !content) {
            throw error(400, 'File content is required');
        }
        if (type === 'link' && !external_url) {
            throw error(400, 'External URL is required for links');
        }

        // Verify parent exists and belongs to user (if parent_id provided)
        if (parent_id) {
            const parentCheck = await pool.query(
                'SELECT id FROM items WHERE id = $1 AND user_id = $2 AND type = $3 AND deleted_at IS NULL',
                [parent_id, user_id, 'folder']
            );
            if (parentCheck.rows.length === 0) {
                throw error(400, 'Invalid parent folder');
            }
        }

        // Get next sort order
        const sortResult = await pool.query(
            'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM items WHERE user_id = $1 AND parent_id = $2 AND deleted_at IS NULL',
            [user_id, parent_id]
        );
        const sort_order = sortResult.rows[0].next_order;

        const result = await pool.query(
            `INSERT INTO items (user_id, parent_id, name, type, content, external_url, link_description, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, name, type, created_at`,
            [user_id, parent_id, name, type, content || null, external_url || null, link_description || null, sort_order]
        );

        return json({
            success: true,
            item: result.rows[0]
        });

    } catch (err: any) {
        console.error('Error creating item:', err);
        return json({ success: false, error: err.message }, { status: 500 });
    }
}

// GET root items for a user
export async function GET({ locals, url }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        const user_id = session.user.id;
        
        const result = await pool.query(
            `SELECT id, name, type, created_at, updated_at,
                    CASE WHEN type = 'folder' THEN 
                        EXISTS(SELECT 1 FROM items c WHERE c.parent_id = items.id AND c.deleted_at IS NULL)
                    ELSE false END as has_children
             FROM items 
             WHERE user_id = $1 AND parent_id IS NULL AND deleted_at IS NULL
             ORDER BY type DESC, sort_order ASC, name ASC`,
            [user_id]
        );

        const items = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            hasChildren: row.has_children
        }));

        return json(items);

    } catch (err) {
        console.error('Error fetching root items:', err);
        return json({ success: false }, { status: 500 });
    }
}