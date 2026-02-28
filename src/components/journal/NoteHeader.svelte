<script lang="ts">
  import AudioRecorderButton from "$components/misc/AudioRecorderButton.svelte";
  
  import type { EditorConfig } from "$lib/types/editor";
  import { type EditorAPI } from "$lib/editor";
  import { createItem, treeContext } from "$lib/stores/treeContext.svelte.js";
  import type { TreeItem } from "$lib/types/files";
  
  import {
    Check,
    FilePlus,
    NotebookPen,
    Save,
    Sparkles,
    UserPen,
    X,
  } from "lucide-svelte";

  // -------------- PROPS ------------------
  let {
    currentFile,
    onTranscriptionComplete,
    placeholdDefaultVal = "path/to/file.ext",
    saveFile,
    loadFile,
    isDirty,
    editorAPI,
  }: {
    currentFile: { id: string; name: string; type: string } | null;
    onTranscriptionComplete: (arg0: string) => void;
    placeholdDefaultVal: string;
    saveFile: () => void;
    loadFile: (file: { id: string; name: string; type: string }) => void;
    isDirty: boolean;
    editorAPI: EditorAPI | null
  } = $props();
  // ----------------------------------------

  let isLoading = $state(false);

  let isEditingName = $state(false);
  let editingName = $state("");

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

  // Manual save function
  async function manualSave() {
    if (!currentFile) return;

    // const content = markdown;
    await saveFile();
  }

  let isCreatingNewFile = $state(false);

  let prefix: string = $state("");

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

  let newPath = $state("");

  let placeholder: string = $state(placeholdDefaultVal);
</script>

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
      <!-- Save button - only when editing an existing file -->
      {#if currentFile && !isCreatingNewFile}
        <button
          class="flex text-gray-600 hover:bg-gray-100 rounded-md px-2 py-2 disabled:opacity-40"
          onclick={manualSave}
          disabled={!isDirty}
        >
          <Save size={16} />
        </button>
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
      <span class="font-medium text-gray-500 italic">No file selected</span>
    {/if}
    {#if isLoading}
      <span class="text-xs text-blue-600">Loading...</span>
    {/if}
  </div>

  <div class="flex items-center space-x-2">
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
            }
          }}
          title="Cancel"
        >
          <X size={18} />
        </button>
      </div>
    {:else}
      <!-- Always available Create new file button -->
      <AudioRecorderButton {onTranscriptionComplete} />
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
