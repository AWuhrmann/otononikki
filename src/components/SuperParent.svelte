<script lang="ts">
    import { deleteCard } from "$lib/card.svelte"
  import { computePosition, flip, offset, shift } from "@floating-ui/dom"
  import { SlidersHorizontal } from "lucide-svelte"
  import { onMount, onDestroy } from "svelte"

  // Props interface
  interface ColorOption {
    id: string
    label: string
    value: string
  }

  // Props
  export let card: any // Replace 'any' with your card type
  export let offsetDistance = 8 // Allow customizing the offset distance

  // State
  let triggerEl: HTMLElement
  let menuEl: HTMLElement
  let open = false
  let cleanup: (() => void) | null = null

  const colors: ColorOption[] = [
    { id: "red", label: "Red", value: "#EF4444" },
    { id: "blue", label: "Blue", value: "#3B82F6" },
    { id: "green", label: "Green", value: "#10B981" },
  ]

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
  $: if (open) {
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
</script>

<div class="relative inline-block">
  <button
    bind:this={triggerEl}
    class="px-4 py-2 text-gray-500 rounded outline-none"
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

          <div class="color-options space-y-2">
            {#each colors as color}
              <label class="color-option flex items-center space-x-2">
                <input
                  type="radio"
                  name="color"
                  value={color.value}
                  bind:group={card.settings["color"]}
                  class="text-blue-500 focus:ring-blue-500"
                />
                <div
                  class="color-preview w-4 h-4 rounded-full"
                  style="background-color: {color.value}"
                ></div>
                <!-- /color-preview -->
              </label><!-- /color-option -->
            {/each}
          </div>
        </div>
          <!-- Delete card button -->
        <div>
          <button class="bg-red-500 hover:bg-red-700 text-white py-1 px-2 roundedborder border-red-200" onclick={delCard}> Delete card </button>
        </div>
      </div>
    </div>
  {/if}
</div>
