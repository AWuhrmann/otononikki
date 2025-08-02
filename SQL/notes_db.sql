-- Main items table (files, folders, and links)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id bigint REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('folder', 'file', 'link')),
    
    -- For files: stores the actual content
    content TEXT,
    
    -- For links: stores the external URL and optional description
    external_url TEXT,
    link_description TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Display order within parent folder
    sort_order INTEGER DEFAULT 0,
    
    CONSTRAINT valid_file_content CHECK (
        (type = 'file' AND content IS NOT NULL) OR 
        (type != 'file')
    ),
    CONSTRAINT valid_link_url CHECK (
        (type = 'link' AND external_url IS NOT NULL) OR 
        (type != 'link')
    ),
    CONSTRAINT no_self_reference CHECK (id != parent_id)
);

-- Indexes for performance
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_parent_id ON items(parent_id);
CREATE INDEX idx_items_user_parent ON items(user_id, parent_id);
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_created_at ON items(created_at);
CREATE INDEX idx_items_updated_at ON items(updated_at);
CREATE INDEX idx_items_sort_order ON items(parent_id, sort_order);

-- Index for soft delete queries
CREATE INDEX idx_items_active ON items(user_id, parent_id) WHERE deleted_at IS NULL;

-- Optional: Full-text search index for content and names
CREATE INDEX idx_items_search ON items USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(content, '') || ' ' || coalesce(link_description, '')));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Item sharing/permissions table for future use
CREATE TABLE item_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id bigint REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('read', 'write', 'admin')),
    granted_by bigint REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(item_id, user_id)
);

CREATE INDEX idx_item_permissions_item_id ON item_permissions(item_id);
CREATE INDEX idx_item_permissions_user_id ON item_permissions(user_id);

-- Helper function to get item path
CREATE OR REPLACE FUNCTION get_item_path(item_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
    current_item RECORD;
    current_id UUID := item_uuid;
BEGIN
    WHILE current_id IS NOT NULL LOOP
        SELECT name, parent_id INTO current_item 
        FROM items 
        WHERE id = current_id AND deleted_at IS NULL;
        
        IF NOT FOUND THEN
            EXIT;
        END IF;
        
        IF result = '' THEN
            result := current_item.name;
        ELSE
            result := current_item.name || '/' || result;
        END IF;
        
        current_id := current_item.parent_id;
    END LOOP;
    
    RETURN '/' || result;
END;
$$ LANGUAGE plpgsql;