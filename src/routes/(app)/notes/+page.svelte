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
  import {
    Check,
    FilePlus,
    NotebookPen,
    Sparkles,
    UserPen,
    X,
  } from "lucide-svelte";

  import { type EditorAPI } from "$lib/editor";

  import { createItem, treeContext } from "$lib/stores/treeContext.svelte.js";
  import { onMount } from "svelte";
  import TaskOptions from "$components/files/tasks/TaskOptions.svelte";
  import {
    addTaskToCalendar,
    ConnectToCalendar,
  } from "$lib/editor/commands/autoLinkFromLLM";
  import type { TreeItem } from "$lib/types/files";

  let editorComponent = $state<EditorComponent>();
  let currentFile = $state<{ id: string; name: string; type: string } | null>(
    null,
  );
  let currentPath = $state("");

  function onCheckFullDay(checked: boolean) {
    console.log(checked);
    editorAPI?.insertMarkdown("test");
  }

  $effect(() => {
    if (currentFile == null) {
      currentPath = "";
      return;
    }

    (async () => {
      let response = await fetch(`api/items/${currentFile.id}/path`);
      let data = await response.json();
      currentPath = data.path;
    })();
  });

  let isLoading = $state(false);
  let isDirty = $state(false);
  let lastSavedContent = $state("");
  const editorConfig: EditorConfig = {
    placeholder: "Start typing your notes...",
    readonly: false,
  };
  let editorAPI = $state<EditorAPI | null>(null);

  let isEditingName = $state(false);
  let editingName = $state("");

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
    highlights: true,
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
    onReady: (api: EditorAPI) => {
      editorAPI = api;
      console.log("Editor ready, API available:", api);
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

  function startEditing() {
    if (!currentFile) return;
    isEditingName = true;
    editingName = currentFile.name;
  }

  function cancelEditing() {
    isEditingName = false;
    editingName = "";
  }

  async function saveNewName() {
    if (!currentFile || !editingName.trim()) {
      cancelEditing();
      return;
    }

    try {
      const result = await treeContext.renameItem(
        currentFile.id,
        editingName.trim(),
      );

      // Update current file reference
      currentFile = { ...currentFile, name: editingName.trim() };

      console.log("File renamed successfully:", result.message);
      isEditingName = false;
      editingName = "";
    } catch (error) {
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      alert("Failed to rename file: " + message);
      // Keep editing mode open on error
    }
  }

  function handleNameKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveNewName();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  // Load file content into editor
  async function loadFile(
    file: { id: string; name: string; type: string },
    content?: string,
  ) {
    if (file.type === "folder") return;

    try {
      isLoading = true;

      // Save current file if dirty before switching
      if (currentFile && isDirty) {
        await saveFile(markdown);
      }

      if (!content) {
        const fileData = await getItemContent(file.id);
        lastSavedContent = fileData.content || "";
      } else {
        lastSavedContent = content;
      }

      currentFile = file;
      isDirty = false;

      // Update editor content
      originalContent = lastSavedContent;
    } catch (error) {
      console.error("Error loading file:", error);
      alert("Failed to load file. Please try again.");
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
        content: content,
      });

      lastSavedContent = content;
      isDirty = false;
      console.log("File saved:", currentFile.name);
    } catch (error) {
      console.error("Error saving file:", error);
      // Don't show alert for auto-save failures, just log
    }
  }

  // Manual save function
  async function manualSave() {
    if (!currentFile) return;

    // const content = markdown;
    await saveFile(markdown);
  }
  // Handle file selection from FileExplorer
  function handleFileSelect(file: { id: string; name: string; type: string }) {
    loadFile(file);
  }

  // Save before page unload
  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (isDirty) {
      event.preventDefault();
      event.returnValue = "";
      return "";
    }
  }

  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === "s") {
        event.preventDefault();
        manualSave();
      }
    }
  }

  let isCreatingNewFile = $state(false);

  let prefix: string = $state("");
  let path: string = $state("");

  function togglePrefix(prefix_: string, placeholder_: string) {
    const folderWithPrefix = treeContext.data.find(
      (item: TreeItem) => item.folderCategory === prefix_,
    );
    if (folderWithPrefix) {
      prefix_ = folderWithPrefix.name;
    }
    if (prefix === prefix_) {
      prefix = "";
      placeholder = placeholdDefaultVal;
    } else {
      placeholder = placeholder_;
      prefix = prefix_;
    }
  }

  let calendar_connected = $state(false);

  onMount(() => {
    calendar_connected =
      page.url.searchParams.get("calendar_connected") === "true";
    console.log("url param", calendar_connected);
  });

  let newPath = $state("");

  const placeholdDefaultVal = "path/to/file.ext";
  let placeholder: string = $state(placeholdDefaultVal);
</script>

<svelte:window
  on:beforeunload={handleBeforeUnload}
  on:keydown={handleKeydown}
/>

{#if page.data.session?.user?.role === "admin"}
  <div class="flex h-screen">
    <!-- Left: File Explorer -->
    <div class="flex-1 flex justify-end">
      <div class="max-w-[320px] w-full mt-5 mr-5">
        <FileExplorer onFileSelect={handleFileSelect} />
      </div>
    </div>

    <!-- Middle: Editor -->
    <div style="height: calc(100vh - 100px);" class="w-1/2 flex flex-col">
      <!-- Header with file info and actions -->
      <div class="flex-shrink-0 px-4 py-2 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          {#if currentFile && !isCreatingNewFile}
            <div class="flex items-center space-x-2">
              {#if isEditingName}
                <!-- svelte-ignore a11y_autofocus -->
                <input
                  type="text"
                  bind:value={editingName}
                  onkeydown={handleNameKeydown}
                  class="font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style="min-width: 200px;"
                  autofocus
                />
                <button
                  onclick={saveNewName}
                  class="text-green-600 hover:text-green-700 p-1"
                  title="Save name"
                >
                  <Check size={16} />
                </button>
                <button
                  onclick={cancelEditing}
                  class="text-red-600 hover:text-red-700 p-1"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              {:else}
                <button
                  onclick={startEditing}
                  class="font-medium text-gray-900 hover:text-blue-600 hover:underline cursor-pointer"
                  title="Click to rename"
                >
                  {currentFile.name}
                </button>
              {/if}
            </div>
            {#if isDirty}
              <span
                class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded"
              >
                Unsaved
              </span>
            {:else}
              <span
                class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded"
              >
                Saved
              </span>
            {/if}
          {:else if isCreatingNewFile}
            <div class="flex whitespace-nowrap items-center">
              <span class="font-medium text-gray-900 mr-3">New File:</span>
              <span class="italic text-gray-700">{prefix}/</span>
              <input
                class="font-medium text-gray-900 border-b border-gray-400 focus:border-blue-500 focus:outline-none bg-transparent"
                {placeholder}
                bind:value={newPath}
              />
            </div>
          {:else}
            <span class="font-medium text-gray-500 italic"
              >No file selected</span
            >
          {/if}
          {#if isLoading}
            <span class="text-xs text-blue-600">Loading...</span>
          {/if}
        </div>

        <div class="flex items-center space-x-2">
          <!-- Save button - only when editing an existing file -->
          {#if currentFile && !isCreatingNewFile}
            <button
              class="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onclick={manualSave}
              disabled={!isDirty}
            >
              Save (Ctrl+S)
            </button>
          {/if}

          <!-- Create new file flow -->
          {#if isCreatingNewFile}
            <!-- File type options when creating -->
            <button
              class="flex gap-2 hover:bg-blue-50 text-blue-700 rounded-md px-3 py-2 text-sm font-medium"
              onclick={() => togglePrefix("contacts", "Name.md")}
            >
              <UserPen size={16} /> Contact
            </button>
            <button
              class="flex gap-2 hover:bg-purple-50 text-purple-700 rounded-md px-3 py-2 text-sm font-medium"
              onclick={() => {
                const today = new Date();
                const formattedDate = today.toISOString().split("T")[0];
                togglePrefix("notes", formattedDate + ".md");
              }}
            >
              <NotebookPen size={16} /> Daily note
            </button>

            <!-- Create/Cancel buttons -->
            <div class="flex gap-2 ml-2">
              <button
                class="hover:bg-green-100 text-green-600 rounded-md p-2 font-bold transition-colors"
                onclick={async () => {
                  const pathData = await createItem(
                    `${prefix}/${newPath || placeholder}`,
                    loadFile,
                    "",
                  );
                  // Reset creation state after successful creation
                  isCreatingNewFile = false;
                  prefix = "";
                  newPath = "";
                  placeholder = placeholdDefaultVal;
                }}
                title="Create file"
              >
                <Check size={18} />
              </button>
              <button
                class="hover:bg-red-100 text-red-600 rounded-md p-2 font-bold transition-colors"
                onclick={() => {
                  isCreatingNewFile = false;
                  prefix = "";
                  newPath = "";
                  placeholder = placeholdDefaultVal;
                  // Reset editor to previous file or welcome state
                  if (currentFile) {
                    loadFile(currentFile);
                  } else {
                    markdown = `# Welcome to your Notes
        
    Select a file from the file explorer to start editing, or create a new file.
    
    ## Getting Started
    - Click on any file in the left panel to open it
    - Your changes are automatically saved
    - Use the toolbar to add links and format text
        `;
                    originalContent = markdown;
                  }
                }}
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>
          {:else}
            <!-- Always available Create new file button -->
            <button
              onclick={() => {
                editorAPI?.autoLinkFromLLM();
              }}
              class="flex text-gray-600 hover:bg-gray-100 rounded-md px-2 py-2"
              ><Sparkles size={16}></Sparkles></button
            >
            <button
              class="flex gap-2 hover:bg-gray-100 text-gray-600 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              onclick={() => {
                // Save current file if dirty before starting new file creation
                if (currentFile && isDirty) {
                  manualSave();
                }

                // Clear current file and enter creation mode
                currentFile = null;
                isCreatingNewFile = true;
                isDirty = false;

                // Reset editor to blank state
                markdown = "";
                originalContent = "";

                // Reset creation form
                prefix = "";
                newPath = "";
                placeholder = placeholdDefaultVal;
              }}
            >
              <FilePlus size={16} />
              Create new file
            </button>
          {/if}
        </div>
      </div>

      <!-- Scrollable editor area -->
      <div
        class="flex-1 border-2 border-solid rounded-lg border-gray-300 overflow-y-auto"
      >
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
    </div>

    <!-- Right: Future panel (could be for tags, outline, etc.) -->
    <div class="flex-1 flex justify-start">
      <div class="max-w-[200px] w-full mt-5 ml-5">
        <!-- Future: Document outline, tags, etc. -->
        {#if currentFile && !isCreatingNewFile}
          <div class="border border-gray-300 rounded-md p-3">
            <h3 class="font-medium text-gray-900 mb-2">File Info</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <div><strong>Name:</strong> {currentFile.name}</div>
              <div><strong>Type:</strong> {currentFile.type}</div>
              <div>
                <strong>Status:</strong>
                {isDirty ? "Modified" : "Saved"}
              </div>
            </div>
          </div>
          {#if currentPath.split("/")[0] == "tasks"}
            <div class="border border-gray-300 rounded-md p-3 mt-4">
              <h3 class="font-medium text-gray-900 mb-2">Task info</h3>
              <div class="text-sm text-gray-600 space-y-1">
                {#if !calendar_connected}<button
                    onclick={async () => {
                      ConnectToCalendar();
                    }}
                    class="font-medium text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                    >Connect to Google Calendar</button
                  >
                {:else}
                  <button
                    onclick={async () => addTaskToCalendar()}
                    class="font-medium text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                    >Add task</button
                  >
                  <TaskOptions {onCheckFullDay} />
                {/if}
              </div>
            </div>
          {/if}
        {:else if isCreatingNewFile}
          <div class="border border-gray-300 rounded-md p-3">
            <h3 class="font-medium text-gray-900 mb-2">Creating New File</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <div>
                <strong>Path:</strong>
                {prefix}/{newPath || placeholder}
              </div>
              <div><strong>Type:</strong> file</div>
              <div class="text-xs text-gray-500 mt-2">
                Choose a template above or enter a custom path
              </div>
            </div>
          </div>
        {:else}
          <div class="border border-gray-300 rounded-md p-3">
            <h3 class="font-medium text-gray-900 mb-2">Getting Started</h3>
            <div class="text-sm text-gray-600 space-y-2">
              <p>
                Select a file from the explorer or create a new one to start
                editing.
              </p>
              <div class="text-xs text-gray-500">
                <strong>Tips:</strong>
                <ul class="list-disc list-inside mt-1 space-y-1">
                  <li>Files auto-save as you type</li>
                  <li>Click filenames to rename</li>
                  <li>Use Ctrl+S to save manually</li>
                </ul>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <h1>Access Denied</h1>
{/if}
