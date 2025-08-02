export async function createItem(data: {
    name: string;
    type: 'folder' | 'file' | 'link';
    parent_id?: string;
    content?: string;
    external_url?: string;
    link_description?: string;
}) {
    const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create item');
    }

    return await response.json();
}

// Update item
export async function updateItem(id: string, data: {
    name: string;
    content?: string;
    external_url?: string;
    link_description?: string;
}) {
    const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to update item');
    }

    return await response.json();
}

// Delete item
export async function deleteItem(id: string) {
    const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete item');
    }

    return await response.json();
}

// Get item content (for editing)
export async function getItemContent(id: string) {
    const response = await fetch(`/api/items/${id}/content`);

    if (!response.ok) {
        throw new Error('Failed to get item content');
    }

    return await response.json();
}

// Move item to different folder
export async function moveItem(item_id: string, new_parent_id: string | null) {
    const response = await fetch('/api/items/move', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id, new_parent_id }),
    });

    if (!response.ok) {
        throw new Error('Failed to move item');
    }

    return await response.json();
}