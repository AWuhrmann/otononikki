<script lang="ts">
    import type { TreeItem } from "$lib/types/files";
    import { Move, Trash2 } from "lucide-svelte";
    import { useTreeContext } from '$lib/stores/treeContext.svelte.js';
    import TreeNode from './TreeNode.svelte';
    
    let { item, level = 0, onFileSelect } = $props<{
        item: TreeItem;
        level?: number;
        onFileSelect: (file: { id: string; name: string; type: string }) => void;
    }>();
    
    // Get tree context for operations
    const treeContext = useTreeContext();
    
    // Use local expanded state that syncs with context
    let expanded = $state(false);
    let children = $state<TreeItem[]>([]);
    let loadingChildren = $state(false);
    let isHovered = $state(false);
    let isDeleting = $state(false);
    let isMoving = $state(false);
    
    // Sync local expanded state with context on mount and context changes
    $effect(() => {
        const contextExpanded = treeContext.isExpanded(item.id);
        if (contextExpanded !== expanded) {
            debugLog(`🔄 Syncing expanded state: local ${expanded} → context ${contextExpanded}`);
            expanded = contextExpanded;
            
            // If now expanded but no children, load them
            if (contextExpanded && children.length === 0 && item.hasChildren && !loadingChildren) {
                debugLog(`🔄 Loading children for synced expanded folder`);
                loadingChildren = true;
                loadChildren(item.id).then(loadedChildren => {
                    children = loadedChildren;
                    debugLog(`✅ Loaded ${loadedChildren.length} children after sync`);
                    loadingChildren = false;
                });
            }
        }
    });
    
    // Drag and drop state
    let isDragging = $state(false);
    let isDragOver = $state(false);
    let dragOverValid = $state(false);
    let nodeElement: HTMLElement;

    // Debug logging with item identification
    function debugLog(message: string, data?: any) {
        const prefix = `[TreeNode-${item.name}(${item.id.slice(0, 8)})]`;
        const expandedState = treeContext.isExpanded(item.id);
        const childrenCount = children.length;
        console.log(`${prefix} ${message} [expanded: ${expandedState}, children: ${childrenCount}]`, data || '');
    }

    function handleMove() {
        console.log('move')
    }
    
    async function loadChildren(parentId: string): Promise<TreeItem[]> {
        try {
            return await treeContext.loadChildren(parentId);
        } catch (error) {
            console.error("Error loading children:", error);
            return [];
        }
    }
    
    async function toggleExpanded() {
        if (!item.hasChildren) return;
        
        const newExpandedState = !expanded;
        
        debugLog(`Toggling expanded: ${expanded} → ${newExpandedState}`);
        
        if (newExpandedState) {
            // Expanding - load children if we don't have them
            if (children.length === 0) {
                loadingChildren = true;
                try {
                    children = await loadChildren(item.id);
                    debugLog(`📁 Loaded ${children.length} children for expansion`);
                } finally {
                    loadingChildren = false;
                }
            }
            expanded = true;
        } else {
            // Collapsing - clear children and update state
            children = [];
            expanded = false;
            debugLog(`📁 Collapsed folder and cleared children`);
        }
        
        // Update context to keep it in sync
        treeContext.setExpanded(item.id, newExpandedState);
    }
    
    function handleNodeClick(event: Event) {
        // Don't trigger if we're dragging
        if (isDragging) return;
        
        if (item.type === 'folder') {
            toggleExpanded();
        } else {
            onFileSelect({
                id: item.id,
                name: item.name,
                type: item.type
            });
        }
    }
    
    async function handleDelete(event: Event) {
        event.stopPropagation();
        
        if (isDeleting) return;
        
        const confirmMessage = item.type === 'folder' 
            ? `Are you sure you want to delete "${item.name}" and all its contents?`
            : `Are you sure you want to delete "${item.name}"?`;
        
        if (!confirm(confirmMessage)) return;
        
        try {
            isDeleting = true;
            await treeContext.deleteItem(item.id);
            debugLog(`✅ Successfully deleted item ${item.id}`);
        } catch (error) {
            debugLog('❌ Error deleting item:', error);
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Please try again.');
        } finally {
            isDeleting = false;
        }
    }

    // Drag and Drop Event Handlers
    function handleDragStart(event: DragEvent) {
        if (!event.dataTransfer) return;
        
        isDragging = true;
        debugLog(`🚀 Drag started`);
        
        // Set drag data
        event.dataTransfer.setData('text/plain', item.id);
        event.dataTransfer.setData('application/json', JSON.stringify({
            id: item.id,
            name: item.name,
            type: item.type
        }));
        
        // Set drag effect
        event.dataTransfer.effectAllowed = 'move';
        
        // Add visual feedback to the dragged element
        if (event.target instanceof HTMLElement) {
            event.target.style.opacity = '0.5';
        }
    }
    
    function handleDragEnd(event: DragEvent) {
        isDragging = false;
        debugLog(`🏁 Drag ended`);
        
        // Reset visual feedback
        if (event.target instanceof HTMLElement) {
            event.target.style.opacity = '1';
        }
    }
    
    function handleDragOver(event: DragEvent) {
        if (!event.dataTransfer) return;
        
        event.preventDefault();
        
        const draggedItemId = event.dataTransfer.getData('text/plain');
        
        // Don't allow dropping on self
        if (draggedItemId === item.id) {
            dragOverValid = false;
            return;
        }
        
        // Only allow dropping on folders
        if (item.type !== 'folder') {
            dragOverValid = false;
            return;
        }
        
        dragOverValid = true;
        event.dataTransfer.dropEffect = 'move';
        debugLog(`✅ Valid drag over`, { draggedItemId, targetId: item.id });
    }
    
    function handleDragEnter(event: DragEvent) {
        event.preventDefault();
        isDragOver = true;
        debugLog(`➡️ Drag enter`);
    }
    
    function handleDragLeave(event: DragEvent) {
        // Only set isDragOver to false if we're actually leaving the entire node element
        // Check if the relatedTarget is outside the current node and all its children
        const relatedTarget = event.relatedTarget as Element;
        if (!nodeElement?.contains(relatedTarget)) {
            isDragOver = false;
            dragOverValid = false;
            debugLog(`⬅️ Drag leave (actually left the node)`);
        }
    }
    
    async function handleDrop(event: DragEvent) {
        event.preventDefault();
        isDragOver = false;
        dragOverValid = false;
        
        if (!event.dataTransfer) return;
        
        const draggedItemId = event.dataTransfer.getData('text/plain');
        const draggedItemData = JSON.parse(event.dataTransfer.getData('application/json') || '{}');
        
        debugLog(`📥 Drop received`, { draggedItemId, draggedItemData, targetFolder: item.name, targetId: item.id });
        
        // Don't allow dropping on self
        if (draggedItemId === item.id) {
            debugLog('❌ Cannot drop item on itself');
            return;
        }
        
        // Only allow dropping on folders
        if (item.type !== 'folder') {
            debugLog('❌ Cannot drop on non-folder item');
            return;
        }
        
        try {
            debugLog(`🚀 Moving item ${draggedItemId} to folder ${item.id}`);
            
            // Use context to move item - this will handle all state updates
            await treeContext.moveItem(draggedItemId, item.id);
            
            debugLog(`✅ Successfully moved item via context`);
            
            // The target folder will be automatically expanded by the context
            // We just need to reload children if it was already expanded
            if (treeContext.isExpanded(item.id)) {
                debugLog(`🔄 Reloading children for already expanded folder`);
                loadingChildren = true;
                try {
                    children = await loadChildren(item.id);
                    debugLog(`🔄 Reloaded children, count: ${children.length}`);
                } finally {
                    loadingChildren = false;
                }
            } else if (!item.hasChildren) {
                // If this folder didn't have children before, mark it as having children
                // The context will expand it automatically
                item = { ...item, hasChildren: true };
                debugLog(`📂 Folder now marked as having children`);
            }
            
        } catch (error) {
            debugLog('❌ Error moving item:', error);
            console.error('Error moving item:', error);
            alert(`Failed to move item: ${error.message}`);
        }
    }
    
    // Load children automatically when folder is expanded via context (drag/drop operations)
    $effect(() => {
        const contextExpanded = treeContext.isExpanded(item.id);
        
        // If context says expanded but we don't have children loaded, load them
        if (contextExpanded && expanded && children.length === 0 && item.hasChildren && !loadingChildren) {
            debugLog(`🔄 Auto-loading children for context-expanded folder (from drag/drop)`);
            loadingChildren = true;
            loadChildren(item.id).then(loadedChildren => {
                children = loadedChildren;
                debugLog(`✅ Auto-loaded ${loadedChildren.length} children from context`);
                loadingChildren = false;
            });
        }
    });
    
    const indent = 15;
</script>

<div 
    class="tree-node" 
    style="padding-left: {indent}px"
    bind:this={nodeElement}
>
    <div 
        class="node-header" 
        class:clickable={item.type !== 'folder'}
        class:folder={item.type === 'folder'}
        class:dragging={isDragging}
        class:drag-over={isDragOver && dragOverValid}
        class:drag-over-invalid={isDragOver && !dragOverValid}
        role="button"
        tabindex="0"
        draggable="true"
        onmouseenter={() => isHovered = true}
        onmouseleave={() => isHovered = false}
        onclick={handleNodeClick}
        onkeydown={(e) => e.key === 'Enter' && handleNodeClick(e)}
        ondragstart={handleDragStart}
        ondragend={handleDragEnd}
        ondragover={handleDragOver}
        ondragenter={handleDragEnter}
        ondragleave={handleDragLeave}
        ondrop={handleDrop}
    >
        {#if item.hasChildren}
            <span class="expand-icon" class:expanded>
                {expanded ? "▼" : "▶"}
            </span>
        {:else}
            <span class="expand-icon"></span>
        {/if}
        
        <span class="icon">
            {item.type === "folder" ? "📁" : item.type === "link" ? "🔗" : "📄"}
        </span>
        
        <span class="name" title={item.name}>{item.name}</span>
        
        {#if loadingChildren}
            <span class="loading">⏳</span>
        {/if}
        
        {#if isDragOver && dragOverValid}
            <span class="drop-indicator">📥</span>
        {/if}
        
        <!-- Actions container with fixed space allocation -->
        <div class="actions-container">
            {#if isHovered && !loadingChildren && !isDragging}
                <button 
                    class="actions-btn move-btn"
                    onclick={handleMove}
                    disabled={isMoving}
                    title="Move {item.name}"
                    aria-label="Move {item.name}"
                >
                    {#if isMoving}
                        <span class="moving">⏳</span>
                    {:else}
                        <Move size={14} />
                    {/if}
                </button>    
            
                <button 
                    class="actions-btn delete-btn"
                    onclick={handleDelete}
                    disabled={isDeleting}
                    title="Delete {item.name}"
                    aria-label="Delete {item.name}"
                >
                    {#if isDeleting}
                        <span class="deleting">⏳</span>
                    {:else}
                        <Trash2 size={14} />
                    {/if}
                </button>
            {/if}
        </div>
    </div>
    
    {#if expanded}
        {#each children as child (child.id)}
            <TreeNode 
                item={child} 
                level={level + 1} 
                {onFileSelect}
            />
        {/each}
    {/if}
</div>

<style>
    .tree-node {
        user-select: none;
        width: 100%;
        box-sizing: border-box;
    }
    
    .node-header {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 3px;
        position: relative;
        transition: all 0.15s ease;
        border: 2px solid transparent;
        min-width: 0;
        width: 100%;
        box-sizing: border-box;
    }
    
    .node-header:hover {
        background-color: #f5f5f5;
    }
    
    .node-header.clickable:hover {
        background-color: #e3f2fd;
    }
    
    .node-header.folder:hover {
        background-color: #f5f5f5;
    }
    
    .node-header:focus {
        outline: 2px solid #007acc;
        outline-offset: -2px;
    }
    
    /* Drag states */
    .node-header.dragging {
        opacity: 0.5;
        cursor: grabbing;
        transform: rotate(2deg);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .node-header.drag-over {
        background-color: #e8f5e8 !important;
        border-color: #4caf50 !important;
        border-style: dashed !important;
        transform: scale(1.02);
    }
    
    .node-header.drag-over-invalid {
        background-color: #ffebee !important;
        border-color: #f44336 !important;
        border-style: dashed !important;
    }
    
    .node-header[draggable="true"] {
        cursor: grab;
    }
    
    .expand-icon {
        width: 16px;
        font-size: 10px;
        color: #666;
        transition: transform 0.15s ease;
        flex-shrink: 0;
    }
    
    .expand-icon.expanded {
        transform: rotate(0deg);
    }
    
    .icon {
        margin: 0 6px;
        flex-shrink: 0;
    }
    
    .name {
        flex: 1;
        font-size: 14px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        min-width: 0; /* Critical: allows text to shrink below its content width */
        margin-right: 4px;
    }
    
    .clickable .name {
        color: #1976d2;
        font-weight: 500;
    }
    
    .loading {
        margin-left: 8px;
        font-size: 12px;
        flex-shrink: 0;
    }
    
    .drop-indicator {
        margin-left: 8px;
        font-size: 12px;
        flex-shrink: 0;
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    
    /* Actions container with fixed width */
    .actions-container {
        display: flex;
        align-items: center;
        width: 56px; /* Fixed width: 24px + 4px + 24px + 4px padding */
        flex-shrink: 0;
        margin-left: auto; /* Push to the right */
    }
    
    .actions-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-left: 4px;
        padding: 0;
        background: none;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        color: #666;
        transition: all 0.15s ease;
        flex-shrink: 0;
        opacity: 0;
        animation: fadeIn 0.2s ease forwards;
    }

    .move-btn:hover:not(:disabled) {
        background-color: rgb(238, 241, 255);
        color: #3a7ed7;
    }
    
    .delete-btn:hover:not(:disabled) {
        background-color: #fee;
        color: #d73a49;
    }
    
    .delete-btn:active:not(:disabled) {
        background-color: #fdd;
        transform: scale(0.95);
    }
    
    .actions-btn:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    .deleting, .moving {
        font-size: 12px;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
</style>