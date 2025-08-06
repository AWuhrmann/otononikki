import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

// Companion endpoint to actually create the file after path setup
// POST /api/items/create-file
// Body: { parentId: "uuid", name: "Me.md", type: "file", content: "..." }
export async function POST({ locals, request }) {
    const session = await locals.getSession();
    if (!session?.user) {
      throw error(401, 'Not authenticated');
    }
  
    try {
      const user_id = session.user.id;
      const { parentId, name, type = 'file', content = '', external_url = null, link_description = null } = await request.json();
  
      if (!name) {
        throw error(400, 'Name is required');
      }
  
      // Verify parent exists and belongs to user (if parentId provided)
      if (parentId) {
        const parentCheck = await pool.query(
          'SELECT id FROM items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL AND type = $3',
          [parentId, user_id, 'folder']
        );
        
        if (parentCheck.rows.length === 0) {
          throw error(404, 'Parent folder not found');
        }
      }
  
      // Check if file already exists
      const existingCheck = await pool.query(
        `SELECT id FROM items 
         WHERE name = $1 AND user_id = $2 AND deleted_at IS NULL
         AND ($3::uuid IS NULL AND parent_id IS NULL OR parent_id = $3)`,
        [name, user_id, parentId]
      );
  
      if (existingCheck.rows.length > 0) {
        return json({
          success: false,
          error: 'File already exists'
        }, { status: 409 });
      }
  
      // Create the file
      const createQuery = `
        INSERT INTO items (user_id, parent_id, name, type, content, external_url, link_description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, type, created_at
      `;
  
      const result = await pool.query(createQuery, [
        user_id, parentId, name, type, content, external_url, link_description
      ]);
  
      return json({
        success: true,
        file: result.rows[0],
        message: `${type} "${name}" created successfully`
      });
  
    } catch (err) {
      console.error('Error creating file:', err);
      return json({ 
        success: false, 
        error: 'Failed to create file' 
      }, { status: 500 });
    }
  }