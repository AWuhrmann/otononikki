// lib/stores/treeContext.svelte.js
import { getContext, setContext } from 'svelte';
import { type TreeItem } from '../types/files.js';

const TREE_CONTEXT = 'tree-operations';

export function createTreeContext() {
    let treeData = $state([]);
    let loading = $state(false);
    
    // Store expanded states to preserve them across reloads
    let expandedItems = $state(new Set());
    
    // Debug logging
    function debugLog(message: string, data = '') {
        console.log(`[TreeContext] ${message}`, data || '');
    }
    
    const context = {
        get data() { return treeData; },
        get loading() { return loading; },
        
        // Expanded state management
        isExpanded(itemId) {
            const result = expandedItems.has(itemId);
            // debugLog(`Checking expanded state for ${itemId}: ${result}`);
            return result;
        },
        
        setExpanded(itemId, expanded) {
            if (expanded) {
                expandedItems.add(itemId);
            } else {
                expandedItems.delete(itemId);
            }
            debugLog(`Set ${itemId.slice(0, 8)} expanded: ${expanded}. Total expanded: ${expandedItems.size}`);
        },
        
        // Load root items
        async loadRootItems() {
            loading = true;
            try {
                const response = await fetch('/api/items');
                if (!response.ok) {
                    throw new Error('Failed to load root items');
                }
                const items = await response.json();
                treeData = items;
                console.log(treeData);
                debugLog(`Loaded ${items.length} root items. Preserved ${expandedItems.size} expanded states`);
                return items;
            } catch (error) {
                debugLog('Error loading root items:', error);
                return [];
            } finally {
                loading = false;
            }
        },
        
        // Load children for a specific item
        async loadChildren(parent: TreeItem) {
            try {
                const parentId = parent.id;
                const parentPath = parent.path || '';
                const response = await fetch(`/api/items/${parentId}/children`);
                if (!response.ok) {
                    throw new Error("Failed to load children");
                }
                const children = await response.json();
                children.forEach((child: TreeItem) => {
                    child.path = `${parentPath}/${child.name}`;
                });
                if (children.length > 0) {
                    debugLog(`First child path: ${children[0].path}`);
                }
                return children;
            } catch (error: any) {
                debugLog('Error loading children:', error);
                return [];
            }
        },
        
        // Move item to new parent
        async moveItem(itemId, newParentId) {
            debugLog(`Moving item ${itemId} to parent ${newParentId}`);
            
            try {
                const response = await fetch('/api/items/move', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        item_id: itemId,
                        new_parent_id: newParentId
                    })
                });
                
                const result = await response.json();
                
                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to move item');
                }
                
                debugLog(`Successfully moved item ${itemId} to ${newParentId}`);
                
                // If moved to a specific parent, ensure that parent is expanded
                if (newParentId) {
                    this.setExpanded(newParentId, true);
                }
                
                // Reload the entire tree to ensure consistency while preserving expanded states
                await this.loadRootItems();
                
                return true;
            } catch (error) {
                debugLog('Error moving item:', error);
                throw error;
            }
        },
        
        // Delete item
        async deleteItem(itemId) {
            debugLog(`Deleting item ${itemId}`);
            
            try {
                // Import deleteItem helper
                const { deleteItem } = await import('$lib/items/helpers');
                await deleteItem(itemId);
                
                debugLog(`Successfully deleted item ${itemId}`);
                
                // Remove from expanded items if it was expanded
                expandedItems.delete(itemId);
                
                // Reload the entire tree
                await this.loadRootItems();
                
                return true;
            } catch (error) {
                debugLog('Error deleting item:', error);
                throw error;
            }
        },
        
        // Find item in tree
        findItem(itemId, items = treeData) {
            for (const item of items) {
                if (item.id === itemId) return item;
                if (item.children) {
                    const found = this.findItem(itemId, item.children);
                    if (found) return found;
                }
            }
            return null;
        },
        
        // Update item locally (for UI optimizations)
        updateItem(itemId, updates) {
            const updateInArray = (items) => {
                return items.map(item => {
                    if (item.id === itemId) {
                        return { ...item, ...updates };
                    }
                    if (item.children) {
                        return { ...item, children: updateInArray(item.children) };
                    }
                    return item;
                });
            };
            
            treeData = updateInArray(treeData);
            debugLog(`Updated item ${itemId}`, updates);
        }
    };
    
    setContext(TREE_CONTEXT, context);
    return context;
}

export function useTreeContext() {
    const context = getContext(TREE_CONTEXT);
    if (!context) {
        throw new Error('useTreeContext must be used within a tree context provider');
    }
    return context;
}