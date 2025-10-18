// GET the id of an item given its path.
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function GET({ locals, params } : { locals: any, params: { path: string } }) {
    const session = await locals.getSession();
    if (!session?.user) {
        throw error(401, 'Not authenticated');
    }

    try {
        const user_id = session.user.id;
        // The path can be an empty string if the user requests the root folder
        const requestedPath = params.path; 

        // 1. Split the path into segments (names)
        // Note: An empty path (or just '/') should map to a parent_id of NULL (the root)
        const pathSegments = requestedPath.split('/').filter(segment => segment.length > 0);

        // 2. Recursive query to find the item ID based on the path segments
        const idQuery = `
            WITH RECURSIVE path_search AS (
                -- Anchor: Find the root item (parent_id IS NULL) whose name matches the first segment
                -- If pathSegments is empty (requesting root), the anchor should just match a single root item
                SELECT id, name, parent_id, 1 as depth
                FROM items
                WHERE 
                    user_id = $1 
                    AND deleted_at IS NULL
                    AND (
                        (array_length($2::text[], 1) IS NULL AND parent_id IS NULL) -- Handles root path: ''
                        OR 
                        (name = $2[1] AND parent_id IS NULL) -- Handles non-root path starting from root
                    )

                UNION ALL

                -- Recursive part: Find the child item whose name matches the next segment
                SELECT i.id, i.name, i.parent_id, ps.depth + 1
                FROM items i
                INNER JOIN path_search ps ON i.parent_id = ps.id
                WHERE 
                    i.user_id = $1 
                    AND i.deleted_at IS NULL
                    AND i.name = $2[ps.depth + 1]
            )
            -- Select the ID of the item at the deepest level (the end of the path)
            SELECT id FROM path_search
            WHERE depth = array_length($2::text[], 1) OR (array_length($2::text[], 1) IS NULL AND parent_id IS NULL);
        `;

        const idResult = await pool.query(idQuery, [user_id, pathSegments]);

        if (idResult.rows.length === 0) {
            throw error(404, 'File or folder not found at the specified path');
        }
        
        // Since paths must be unique for a given user, there should only be one result.
        // We return the ID of the item found at the end of the path.
        const file_id = idResult.rows[0].id;

        return json({ id: file_id });

    } catch (err) {
        // If it's a SvelteKit error (404), re-throw it. Otherwise, log and return 500.
        if (err.status) {
            throw err;
        }
        console.error('Error fetching ID from path:', err);
        return json({ success: false }, { status: 500 });
    }
}