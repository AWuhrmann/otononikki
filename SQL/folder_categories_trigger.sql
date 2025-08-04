CREATE OR REPLACE FUNCTION create_default_folders()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO items (id, user_id, name, type, folder_category) VALUES
    (gen_random_uuid(), NEW.id, 'Journal', 'folder', 'notes'),
    (gen_random_uuid(), NEW.id, 'Photos', 'folder', 'photos'),
    (gen_random_uuid(), NEW.id, 'Contacts', 'folder', 'contacts');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Then create the trigger on your users table
CREATE TRIGGER trigger_create_default_folders
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_folders();