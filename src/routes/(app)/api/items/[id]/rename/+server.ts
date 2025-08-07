// src/routes/api/items/[id]/rename/+server.js
// PUT /api/items/{id}/rename
// Body: { name: "NewFileName.md" }
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

/**
 * @swagger
 * /items/{id}/rename:
 *   put:
 *     summary: Rename an item
 *     tags: [Filesystem]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the item
 *                 example: "MyDocument.md"
 *     responses:
 *       200:
 *         description: Item renamed successfully
 *       400:
 *         description: Invalid name or name conflict
 *       404:
 *         description: Item not found
 */
export async function PUT({ locals, params, request }) {
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, 'Not authenticated');
  }

  try {
    const user_id = session.user.id;
    const item_id = params.id;
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return json({
        success: false,
        error: 'Name is required and must be a non-empty string'
      }, { status: 400 });
    }

    const trimmedName = name.trim();

    // Validate name (basic validation - you can expand this)
    if (trimmedName.length > 255) {
      return json({
        success: false,
        error: 'Name is too long (maximum 255 characters)'
      }, { status: 400 });
    }

    // Check if item exists and belongs to user
    const itemCheck = await pool.query(
      'SELECT id, name, parent_id FROM items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [item_id, user_id]
    );

    if (itemCheck.rows.length === 0) {
      return json({
        success: false,
        error: 'Item not found'
      }, { status: 404 });
    }

    const item = itemCheck.rows[0];

    // Check if name is the same (no change needed)
    if (item.name === trimmedName) {
      return json({
        success: true,
        message: 'Name unchanged',
        item: {
          id: item.id,
          name: item.name
        }
      });
    }

    // Check for name conflicts in the same directory
    const conflictCheck = await pool.query(`
      SELECT id FROM items 
      WHERE name = $1 
        AND user_id = $2 
        AND deleted_at IS NULL 
        AND id != $3
        AND ($4::uuid IS NULL AND parent_id IS NULL OR parent_id = $4)
    `, [trimmedName, user_id, item_id, item.parent_id]);

    if (conflictCheck.rows.length > 0) {
      return json({
        success: false,
        error: 'An item with this name already exists in the same location'
      }, { status: 409 });
    }

    // Update the item name
    const updateQuery = `
      UPDATE items 
      SET name = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 AND user_id = $3 
      RETURNING id, name, type, updated_at
    `;

    const updateResult = await pool.query(updateQuery, [trimmedName, item_id, user_id]);

    return json({
      success: true,
      message: `Item renamed to "${trimmedName}"`,
      item: updateResult.rows[0]
    });

  } catch (err) {
    console.error('Error renaming item:', err);
    return json({
      success: false,
      error: 'Failed to rename item'
    }, { status: 500 });
  }
}