-- Get the user ID for sample data
DO $$
DECLARE
    user_uuid bigint;
    folder_uuid UUID;
BEGIN
    SELECT id INTO user_uuid FROM users WHERE name = 'AWuhrmann';
    
    -- Create root folder
    INSERT INTO items (user_id, name, type) 
    VALUES (user_uuid, 'contacts', 'folder') 
    RETURNING id INTO folder_uuid;
    
    -- Create a subfolder
    INSERT INTO items (user_id, parent_id, name, type) 
    VALUES (user_uuid, folder_uuid, 'family', 'folder');
    
    -- Create a file
    INSERT INTO items (user_id, parent_id, name, type, content) 
    VALUES (user_uuid, folder_uuid, 'Me.md', 'file', '# Welcome to my notes\n\nThis is a sample note.');
    
END $$;