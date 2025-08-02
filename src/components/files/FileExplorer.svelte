<script lang="ts">
    import { createTreeContext } from '$lib/stores/treeContext.svelte.js';
    import TreeNode from './TreeNode.svelte';
    
    let { onFileSelect } = $props<{
        onFileSelect: (file: { id: string; name: string; type: string }) => void;
    }>();
    
    // Create tree context for all child components
    const treeContext = createTreeContext();
    
    // Root drop zone state
    let isRootDragOver = $state(false);
    let rootDragValid = $state(false);
    let rootDropZone: HTMLElement;
    
    // Debug logging
    function debugLog(message: string, data?: any) {
        console.log(`[FileExplorer-ROOT] ${message}`, data || '');
    }
    
    // Load root items on mount
    $effect(() => {
        treeContext.loadRootItems();
    });
    
    // Root drop zone handlers
    function handleRootDragOver(event: DragEvent) {
        if (!event.dataTransfer) return;
        
        event.preventDefault();
        
        const draggedItemId = event.dataTransfer.getData('text/plain');
        
        // Allow dropping any item to root
        rootDragValid = true;
        event.dataTransfer.dropEffect = 'move';
        debugLog(`Root drag over with item: ${draggedItemId}`);
    }
    
    function handleRootDragEnter(event: DragEvent) {
        event.preventDefault();
        isRootDragOver = true;
        debugLog('Root drag enter');
    }
    
    function handleRootDragLeave(event: DragEvent) {
        // Only set to false if we're actually leaving the root drop zone
        if (event.currentTarget === event.target || !rootDropZone?.contains(event.relatedTarget as Node)) {
            isRootDragOver = false;
            rootDragValid = false;
            debugLog('Root drag leave');
        }
    }
    
    async function handleRootDrop(event: DragEvent) {
        event.preventDefault();
        isRootDragOver = false;
        rootDragValid = false;
        
        if (!event.dataTransfer) return;
        
        const draggedItemId = event.dataTransfer.getData('text/plain');
        const draggedItemData = JSON.parse(event.dataTransfer.getData('application/json') || '{}');
        
        debugLog(`Root drop received`, { draggedItemId, draggedItemData });
        
        try {
            debugLog(`Attempting to move item ${draggedItemId} to root`);
            
            // Use context to move item to root (null parent)
            await treeContext.moveItem(draggedItemId, null);
            
            debugLog(`Successfully moved item ${draggedItemId} to root`);
            
        } catch (error: any) {
            debugLog('Error moving item to root:', error);
            console.error('Error moving item to root:', error);
            alert(`Failed to move item to root: ${error.message}`);
        }
    }
</script>

<div class="file-explorer">
    <h3>File Explorer</h3>
    
    <!-- Root Drop Zone Indicator -->
    <div 
        class="root-drop-zone"
        class:root-drag-over={isRootDragOver && rootDragValid}
        bind:this={rootDropZone}
        ondragover={handleRootDragOver}
        ondragenter={handleRootDragEnter}
        ondragleave={handleRootDragLeave}
        ondrop={handleRootDrop}
    >
        {#if isRootDragOver && rootDragValid}
            <div class="root-drop-indicator">
                📁 Drop here to move to root folder
            </div>
        {:else}
            <div class="root-drop-hint">
                💡 Drag items here to move to root
            </div>
        {/if}
    </div>
    
    <div class="items-container">
        <div class="items-scroll-wrapper">
            {#if treeContext.loading}
                <div class="loading-state">Loading...</div>
            {:else if treeContext.data.length === 0}
                <div class="empty-state">No files or folders found</div>
            {:else}
                {#each treeContext.data as item (item.id)}
                    <TreeNode
                        {item}
                        level={0}
                        {onFileSelect}
                    />
                {/each}
            {/if}
        </div>
    </div>
</div>

<style>
    .file-explorer {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 12px;
        width: 320px; /* Fixed width */
        background: white;
        box-sizing: border-box;
        overflow: hidden;
    }
    
    .file-explorer h3 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #2c3e50;
    }
    
    .root-drop-zone {
        margin-bottom: 12px;
        padding: 8px;
        border: 2px dashed #ddd;
        border-radius: 4px;
        text-align: center;
        font-size: 12px;
        color: #666;
        transition: all 0.2s ease;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .root-drop-zone.root-drag-over {
        border-color: #4caf50;
        background-color: #e8f5e8;
        color: #2e7d32;
        transform: scale(1.02);
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
    }
    
    .root-drop-indicator {
        font-weight: 500;
        animation: pulse 1s infinite;
    }
    
    .root-drop-hint {
        opacity: 0.7;
        font-style: italic;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .items-container {
        /* Fixed dimensions to prevent expansion */
        width: 100%;
        max-height: 600px; /* Adjust as needed */
        overflow: hidden;
    }
    
    .items-scroll-wrapper {
        width: 100%;
        height: 100%;
        overflow-x: auto; /* Allow horizontal scrolling if needed */
        overflow-y: auto; /* Allow vertical scrolling */
        padding-right: 4px; /* Space for scrollbar */
    }
    
    /* Custom scrollbar styling */
    .items-scroll-wrapper::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    
    .items-scroll-wrapper::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    .items-scroll-wrapper::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }
    
    .items-scroll-wrapper::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
    
    .loading-state, .empty-state {
        padding: 20px;
        text-align: center;
        color: #666;
        font-style: italic;
    }
    
    .empty-state {
        border: 2px dashed #ddd;
        border-radius: 4px;
        margin: 8px 0;
    }
</style>