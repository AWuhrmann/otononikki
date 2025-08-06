// POST /api/items/create-path
// Body: { path: "/contacts/family/Me.md", type: "file", content?: "...", folder_category?: "..." }
import { error, json } from '@sveltejs/kit';
import { pool } from '$lib/server/db';

export async function POST({ locals, request }) {
  const session = await locals.getSession();
  if (!session?.user) {
    throw error(401, 'Not authenticated');
  }

  const client = await pool.connect();
  
  try {
    const user_id = session.user.id;
    const { path, type = 'file', content = ''} = await request.json();

    if (!path || typeof path !== 'string') {
      throw error(400, 'Path is required and must be a string');
    }

    // Start transaction
    await client.query('BEGIN');

    // Clean and split the path
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const pathSegments = cleanPath.split('/').filter(segment => segment.length > 0);

    if (pathSegments.length === 0) {
      throw error(400, 'Invalid path');
    }

    const fileName = pathSegments[pathSegments.length - 1];
    const folderSegments = pathSegments.slice(0, -1);
    
    let currentParentId = null;
    const createdFolders = [];
    let fileAlreadyExists = false;
    let existingFile = null;

    // Create/navigate through folder structure
    for (let i = 0; i < folderSegments.length; i++) {
      const folderName = folderSegments[i];
      
      // Check if folder already exists
      const existingFolderQuery = `
        SELECT id, name FROM items 
        WHERE name = $1 
          AND type = 'folder'
          AND user_id = $2 
          AND deleted_at IS NULL
          AND ($3::uuid IS NULL AND parent_id IS NULL OR parent_id = $3)
      `;
      
      const existingResult: any = await client.query(existingFolderQuery, [folderName, user_id, currentParentId]);
      
      if (existingResult.rows.length > 0) {
        // Folder exists, use it
        currentParentId = existingResult.rows[0].id;
      } else {
        // Create new folder
        const createFolderQuery = `
          INSERT INTO items (user_id, parent_id, name, type, content)
          VALUES ($1, $2, $3, 'folder', '')
          RETURNING id, name
        `;
        
        const newFolderResult: any = await client.query(createFolderQuery, [
          user_id, 
          currentParentId, 
          folderName, 
        ]);
        
        const newFolder = newFolderResult.rows[0];
        currentParentId = newFolder.id;
        createdFolders.push({
          id: newFolder.id,
          name: newFolder.name,
          path: '/' + pathSegments.slice(0, i + 1).join('/')
        });
      }
    }

    // Check if final file already exists
    const existingFileQuery = `
      SELECT id, name, type, content FROM items 
      WHERE name = $1 
        AND user_id = $2 
        AND deleted_at IS NULL
        AND ($3::uuid IS NULL AND parent_id IS NULL OR parent_id = $3)
    `;
    
    const existingFileResult = await client.query(existingFileQuery, [fileName, user_id, currentParentId]);
    
    if (existingFileResult.rows.length > 0) {
      fileAlreadyExists = true;
      existingFile = existingFileResult.rows[0];
    }

    // Commit the transaction (folders are created regardless of file existence)
    await client.query('COMMIT');

    // Prepare response
    const response: {
      success: boolean;
      path: string;
      parentId: any;
      createdFolders: { id: any; name: any; path: string }[];
      fileExists: boolean;
      warning?: string;
      message?: string;
      existingFile?: {
        id: any;
        name: string;
        type: string;
        content: string;
      };
      readyToCreate?: {
        name: string;
        type: string;
        parentId: any;
        suggestedContent: string;
      };
    } = {
      success: true,
      path,
      parentId: currentParentId,
      createdFolders,
      fileExists: fileAlreadyExists
    };

    if (fileAlreadyExists) {
      response.warning = `File "${fileName}" already exists`;
      response.existingFile = {
        id: existingFile.id,
        name: existingFile.name,
        type: existingFile.type,
        content: existingFile.content
      };
    } else {
      response.message = `Path created successfully. Ready to create "${fileName}"`;
      response.readyToCreate = {
        name: fileName,
        type,
        parentId: currentParentId,
        suggestedContent: content
      };
    }

    return json(response);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating path:', err);
    return json({ 
      success: false, 
      error: 'Failed to create path structure' 
    }, { status: 500 });
  } finally {
    client.release();
  }
}