<script lang="ts">
    import { page } from "$app/state";
    import FileExplorer from "$components/files/FileExplorer.svelte";
    import EditorComponent from "$components/journal/EditorComponent.svelte";
    import { getItemContent, updateItem } from "$lib/items/helpers";
    import type {
        EditorConfig,
        EditorPluginConfig,
        EditorActionHandlers,
    } from "$lib/types/editor";
    
    let editorComponent: EditorComponent;
    let currentFile = $state<{id: string, name: string, type: string} | null>(null);
    let isLoading = $state(false);
    let isDirty = $state(false);
    let lastSavedContent = $state("");
    
    const editorConfig: EditorConfig = {
        placeholder: "Start typing your notes...",
        readonly: false,
    };

    let originalContent = $state("");
    
    let markdown = `# Welcome to your Notes
        
    Select a file from the file explorer to start editing, or create a new file.
    
    ## Getting Started
    - Click on any file in the left panel to open it
    - Your changes are automatically saved
    - Use the toolbar to add links and format text
        `;
    const pluginConfig: EditorPluginConfig = {
        links: {
            enableTooltip: true,
            clickHandlers: {
                onTaskFile: (href) => {
                    console.log("Opening task:", href);
                    // Navigate to task or open in sidebar
                },
                onTaskMissing: (path) => {
                    console.log("Would create task:", path);
                    // Show task creation dialog
                },
                onContactFile: (href) => {
                    console.log("Opening contact:", href);
                    // Navigate to contact or open in sidebar
                },
            },
        },
    };
    
    const actionHandlers: EditorActionHandlers = {
        onChange: (event) => {
            if (currentFile && event.markdown !== lastSavedContent) {
                isDirty = true;
                // Auto-save with debounce
                markdown = event.markdown;
                debouncedSave(event.markdown);
            }
        },
        onReady: () => {
            console.log("Editor is ready!");
        },
    };
    
    // Debounced save function
    let saveTimeout: NodeJS.Timeout;
    function debouncedSave(content: string) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveFile(content);
        }, 1000); // Save 1 second after user stops typing
    }
    
    // Load file content into editor
    async function loadFile(file: {id: string, name: string, type: string}) {
        if (file.type === 'folder') return;
        
        try {
            isLoading = true;
            
            // Save current file if dirty before switching
            if (currentFile && isDirty) {
                await saveFile(markdown);
            }
            
            const fileData = await getItemContent(file.id);
            
            currentFile = file;
            lastSavedContent = fileData.content || "";
            isDirty = false;
            
            // Update editor content
            originalContent = lastSavedContent;
            
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Failed to load file. Please try again.');
        } finally {
            isLoading = false;
        }
    }
    
    // Save file content
    async function saveFile(content: string) {
        if (!currentFile || !isDirty) return;
        
        try {
            await updateItem(currentFile.id, {
                name: currentFile.name,
                content: content
            });
            
            lastSavedContent = content;
            isDirty = false;
            console.log('File saved:', currentFile.name);
            
        } catch (error) {
            console.error('Error saving file:', error);
            // Don't show alert for auto-save failures, just log
        }
    }
    
    // Manual save function
    async function manualSave() {
        if (!currentFile) return;
        
        // const content = markdown;
        await saveFile(markdown);
    }


    // Toolbar actions
    function addTaskLink() {
        const taskName = prompt("Task name:");
        if (taskName) {
            editorComponent.addSmartLink(taskName, "task", true);
        }
    }
    
    function addMissingContact() {
        const contactName = prompt("Contact name:");
        if (contactName) {
            editorComponent.addSmartLink(contactName, "contact", false);
        }
    }

    function getContent() {
        alert(markdown);
    }
    
    // Handle file selection from FileExplorer
    function handleFileSelect(file: {id: string, name: string, type: string}) {
        loadFile(file);
    }
    
    // Save before page unload
    function handleBeforeUnload(event: BeforeUnloadEvent) {
        if (isDirty) {
            event.preventDefault();
            event.returnValue = '';
            return '';
        }
    }
    
    // Keyboard shortcuts
    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey || event.metaKey) {
            if (event.key === 's') {
                event.preventDefault();
                manualSave();
            }
        }
    }

    </script>
    
    <svelte:window on:beforeunload={handleBeforeUnload} on:keydown={handleKeydown} />
    
    {#if page.data.session?.user?.role === "admin"}
        <div class="flex h-screen">
            <!-- Left: File Explorer -->
            <div class="flex-1 flex justify-end">
                <div class="max-w-[320px] w-full mt-5 mr-5">
                    <FileExplorer onFileSelect={handleFileSelect} />
                </div>
            </div>
            
            <!-- Middle: Editor -->
            <div style="height: calc(100vh - 100px);" class="w-1/2 mt-5 border-2 border-solid rounded-md border-gray-300 flex flex-col">
                <!-- Header with file info and actions -->
                <div class="flex-shrink-0 px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        {#if currentFile}
                            <span class="font-medium text-gray-900">{currentFile.name}</span>
                            {#if isDirty}
                                <span class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Unsaved</span>
                            {:else}
                                <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Saved</span>
                            {/if}
                        {:else}
                            <span class="text-gray-500 italic">No file selected</span>
                        {/if}
                        
                        {#if isLoading}
                            <span class="text-xs text-blue-600">Loading...</span>
                        {/if}
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        {#if currentFile}
                            <button 
                                class="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                onclick={manualSave}
                                disabled={!isDirty}
                            >
                                Save (Ctrl+S)
                            </button>
                        {/if}
                        
                        <button 
                            class="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                            onclick={getContent}
                            disabled={!currentFile}
                        >
                            Add Task
                        </button>
                        
                        <button 
                            class="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                            onclick={addMissingContact}
                            disabled={!currentFile}
                        >
                            Add Contact
                        </button>
                    </div>
                </div>
                
                <!-- Scrollable editor area -->
                <div class="flex-1 overflow-y-auto">
                    <EditorComponent
                        bind:this={editorComponent}
                        config={editorConfig}
                        {pluginConfig}
                        {actionHandlers}
                        bind:originalMarkdown={originalContent}
                    >
                        <div slot="statusbar" let:editorReady let:lastSetValue></div>
                    </EditorComponent>
                </div>
                
                <!-- Fixed statusbar at bottom -->
                <div class="flex-shrink-0 px-3 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600 flex justify-between">
                    <span>Status: Ready</span>
                    <span>{currentFile ? markdown.length || 0 : 0} characters</span>
                </div>
            </div>
            
            <!-- Right: Future panel (could be for tags, outline, etc.) -->
            <div class="flex-1 flex justify-start">
                <div class="max-w-[200px] w-full mt-5 ml-5">
                    <!-- Future: Document outline, tags, etc. -->
                    {#if currentFile}
                        <div class="border border-gray-300 rounded-md p-3">
                            <h3 class="font-medium text-gray-900 mb-2">File Info</h3>
                            <div class="text-sm text-gray-600 space-y-1">
                                <div><strong>Name:</strong> {currentFile.name}</div>
                                <div><strong>Type:</strong> {currentFile.type}</div>
                                <div><strong>Status:</strong> {isDirty ? 'Modified' : 'Saved'}</div>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {:else}
        <h1>Access Denied</h1>
    {/if}