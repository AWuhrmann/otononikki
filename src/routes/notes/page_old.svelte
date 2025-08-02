<script lang="ts">
    import { page } from "$app/state";
    import { onDestroy } from "svelte";
    import { Crepe } from "@milkdown/crepe";
    import { SquarePen, X } from "lucide-svelte";
    import "@milkdown/crepe/theme/common/style.css";
    import "@milkdown/crepe/theme/frame.css";
  
    let showWindow = $state(false);
    let newNoteTitle = $state("Note title");
    let markdown = "Start writing…";
    let crepeInstance;
    let container: HTMLDivElement;
  
  function openModal() {
    showWindow = true;
    // initialize editor after it appears
    requestAnimationFrame(() => {
      if (container) {
        let crepeInstance: Crepe = new Crepe({
          root: container,
          defaultValue: markdown,
        });
        crepeInstance.create().then(() => {
          const editor = crepeInstance.editor; // This is a Milkdown `Editor` instance

          // Now you can do this:
          editor.use(customTooltipPlugin);
        });
        crepeInstance.on("markdownUpdated", (_, md) => (markdown = md));
      }
    });
  }

  function closeModal() {
    showWindow = false;
    crepeInstance?.destroy();
    crepeInstance = null;
  }

  onDestroy(() => {
    crepeInstance?.destroy();
  });
</script>

{#if page.data.session?.user?.role === "admin"}
  <div class="flex h-full min-h-0">
    <div class="w-1/4"></div>
    <div class="h-full w-1/2 flex flex-col min-h-0">
      <div class="pt-10 pb-5 text-2xl text-gray-600 font-bold flex-shrink-0">
        Notes
      </div>
      <div class="px-4 flex flex-shrink-0">
        <span class="pr-5 text-md mt-1">Enter note title:</span>
        <input class="flex-1 border-2 rounded-md border-gray-300" />
        <button
          on:click={openModal}
          class="text-gray-600 ml-5 p-1 rounded-md hover:bg-gray-100"
        >
          <SquarePen />
        </button>

        {#if showWindow}
          <div class="fixed inset-0 flex items-start justify-center pt-24 z-50">
            <div
              class="bg-white text-black border border-gray-300 rounded-xl p-6 w-full max-w-6xl shadow-lg relative"
            >
              <button
                on:click={closeModal}
                class="absolute top-3 right-3 text-gray-500 hover:text-black"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <input
                bind:value={newNoteTitle}
                class="text-4xl font-semibold mb-1"
                placeholder="Note title..."
              />

              <div
                bind:this={container}
                class="crepe-editor prose max-w-none"
              ></div>

              <div class="mt-0 flex justify-end gap-2">
                <button
                  on:click={closeModal}
                  class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Add note
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
      <div class="flex py-4 max-h-[600px]">
        <div class="flex-1 overflow-y-auto px-2 min-h-0 max-h-full">
          <div class="flex flex-col gap-1">
            <!-- ... your notes list ... -->
          </div>
        </div>
      </div>
    </div>
    <div class="w-1/4"></div>
  </div>
{:else}
  <h1>Access Denied</h1>
{/if}
