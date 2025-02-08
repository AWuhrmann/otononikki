<script lang="ts">
  import { deleteCard } from "$lib/card.svelte"
  import { computePosition, flip, offset, shift } from "@floating-ui/dom"
  import { SlidersHorizontal, Download } from "lucide-svelte"
  import { colors } from "$lib/colors"

  import { onMount, onDestroy } from "svelte"

  // Props interface
  interface ColorOption {
    id: string
    label: string
    value: string
  }

  // Props
  let { card = $bindable(), offsetDistance = 8 } = $props() // Replace 'any' with your card type

  // State
  let triggerEl: HTMLElement
  let menuEl: HTMLElement
  let open = $state(false)
  let cleanup: (() => void) | null = null

  function downloadJson() {
    // Convert the data object to a JSON string
    const jsonString = JSON.stringify(card, null, 2);
    
    // Create a blob with the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json'; // Name of the downloaded file
    
    // Append the link to the body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }


  function delCard(): void {
    deleteCard(card.id)
  }
  function updatePosition(): void {
    if (!triggerEl || !menuEl) return

    computePosition(triggerEl, menuEl, {
      placement: "right", // Changed to 'right' for consistent right positioning
      middleware: [
        offset({ mainAxis: offsetDistance }), // Add horizontal offset
        flip({
          fallbackPlacements: ["left"], // Flip to left if not enough space on right
        }),
        shift({ padding: 8 }), // Add some padding to prevent getting too close to viewport edges
      ],
    }).then(({ x, y }) => {
      Object.assign(menuEl.style, {
        left: `${x}px`,
        top: `${y}px`,
      })
    })
  }

  function handleClickOutside(event: MouseEvent): void {
    const target = event.target as Node
    if (!menuEl?.contains(target) && !triggerEl?.contains(target)) {
      open = false
    }
  }

  // Add window resize handler for responsive positioning
  function handleResize(): void {
    if (open) {
      updatePosition()
    }
  }

  // Reactive statement
  $effect(() => {
    if (open) {
      updatePosition()
      document.addEventListener("click", handleClickOutside)
      window.addEventListener("resize", handleResize)
      cleanup = () => {
        document.removeEventListener("click", handleClickOutside)
        window.removeEventListener("resize", handleResize)
      }
    } else if (cleanup) {
      cleanup()
      cleanup = null
    }

    onDestroy(() => {
      if (cleanup) cleanup()
    })
  })
</script>

<div class="relative inline-block">
  <button
    bind:this={triggerEl}
    class="text-gray-500 rounded outline-none"
    onclick={() => (open = !open)}
  >
    <SlidersHorizontal />
  </button>

  {#if open}
    <div
      bind:this={menuEl}
      class="fixed z-50 w-64 bg-white shadow-lg rounded-md border border-gray-200 p-4"
    >
      <div class="space-y-4">
        <!-- Input field -->
        <div>
          <label for="block text-sm font-medium text-gray-700 mb-1">
            Input Label
          </label>
          <input
            type="text"
            bind:value={card.name}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text..."
          />
        </div>

        <!-- Color selection -->
        <!-- Color selection section -->
        <div class="color-selection">
          <label for="block text-sm font-medium text-gray-700 mb-2">
            Select Color
          </label>

          <div class="color-options flex gap-2">
            {#each colors as color}
              <button
                class="color-button w-8 h-8 rounded-full border-2 transition-all"
                style="background-color: {color.value}; border-color: {card
                  .settings['color'] === color.value
                  ? color.value
                  : 'transparent'}"
                onclick={() => (card.settings["color"] = color.value)}
                aria-checked={card.settings["color"] === color.value}
                aria-label="color of the plot"
                role="radio"
              ></button>
            {/each}
          </div>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={card.settings.showUnit}
              onchange={(e) => {
                card.settings.showUnit = e.target.checked
                if (!e.target.checked) {
                  card.settings.unit = ""
                }
              }}
              class="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
            />
            <span class="block text-sm font-medium text-gray-700">Unit</span>
          </label>

          <input
            type="text"
            bind:value={card.settings.unit}
            disabled={!card.settings.showUnit}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter unit..."
          />
        </div>
        <!-- Delete card button -->
        <div class="flex justify-between">
          <button
            class="bg-red-500 hover:bg-red-700 text-white py-1 px-2 roundedborder border-red-200"
            onclick={delCard}
          >
            Delete card
          </button>
          <button
            onclick={downloadJson}
          >
            <Download />
          </button>

        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .color-button {
    cursor: pointer;
    outline: none;
  }

  .color-button:hover {
    transform: scale(1.1);
  }

  .color-button[aria-checked="true"] {
    box-shadow:
      0 0 0 2px white,
      0 0 0 4px currentColor;
  }
</style>
