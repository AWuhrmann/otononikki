<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";

  import FileExplorer from "$components/files/FileExplorer.svelte";
  import NoteHeader from "$components/journal/NoteHeader.svelte";
  import EditorComponent from "$components/journal/EditorComponent.svelte";
  import TaskOptions from "$components/files/tasks/TaskOptions.svelte";

  import type {
    EditorConfig,
    EditorPluginConfig,
    EditorActionHandlers,
  } from "$lib/types/editor";
  import { type EditorAPI } from "$lib/editor";
  import { getItemContent, updateItem } from "$lib/items/helpers";
  import {
    addTaskToCalendar,
    ConnectToCalendar,
  } from "$lib/editor/commands/autoLinkFromLLM";
    import { createItem, treeContext } from "$lib/stores/treeContext.svelte";

  onMount(() => {
    calendar_connected =
      page.url.searchParams.get("calendar_connected") === "true";
    console.log("url param", calendar_connected);
  });

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

  let calendar_connected = $state(false);
  const placeholdDefaultVal = "path/to/file.ext";

  let originalContent = $state("");

  let markdown = $state("");

  let editorComponent = $state<EditorComponent>();
  let currentFile = $state<{ id: string; name: string; type: string } | null>(
    null,
  );
  let currentPath = $state("");

  const pluginConfig: EditorPluginConfig = {
    links: {
      enableTooltip: true,
      clickHandlers: {
        onTaskFile: async (href) => {
          const path = await createItem(href, loadFile,`# ${href}
\`\`\`
start_date=
end_date=
\`\`\`
`)
          
          if (!path.fileExists) { 
            console.log("Error ??? The file should have been created by now")
            return
          }

          // Reload the items :)) 
          
          if (path?.existingFile) {
            loadFile(path?.existingFile)
          }
          treeContext.loadRootItems();
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
      console.log("originalContent: ", originalContent)
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

  function onTranscriptionComplete(newTranscription: string) {
    editorAPI?.insertMarkdown(newTranscription);
  }
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
      <NoteHeader
        {currentFile}
        {onTranscriptionComplete}
        {placeholdDefaultVal}
        saveFile={() => saveFile(editorAPI?.getMarkdown() ?? "")}
        {loadFile}
        {isDirty}
        {editorAPI}
      ></NoteHeader>

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
        {#if currentFile}
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
                  <TaskOptions insertMarkdown={editorAPI?.insertMarkdownAfterPattern} />
                {/if}
              </div>
            </div>
          {/if}
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
