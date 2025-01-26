<script>
    import { computePosition, flip, offset, shift } from '@floating-ui/dom';
    import { SlidersHorizontal } from 'lucide-svelte'
    import { onMount, onDestroy } from 'svelte';
    
    let triggerEl;
    let menuEl;
    let open = $state(false);
    let cleanup = null;
    let inputValue = $state('');
    let selectedColor = $state('red');
    
    function updatePosition() {
      if (!triggerEl || !menuEl) return;
      
      computePosition(triggerEl, menuEl, {
        placement: 'right-start',
        middleware: [
          offset(8),
          flip(),
          shift()
        ]
      }).then(({ x, y }) => {
        Object.assign(menuEl.style, {
          left: `${x}px`,
          top: `${y}px`
        });
      });
    }
    
    function handleClickOutside(event) {
      if (!menuEl?.contains(event.target) && !triggerEl?.contains(event.target)) {
        open = false;
      }
    }
    
    $effect(() => {
      if (open) {
        updatePosition();
        document.addEventListener('click', handleClickOutside);
        cleanup = () => document.removeEventListener('click', handleClickOutside);
      } else if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });
    
    onDestroy(() => {
      if (cleanup) cleanup();
    });
    
    const colors = [
      { id: 'red', label: 'Red', value: '#EF4444' },
      { id: 'blue', label: 'Blue', value: '#3B82F6' },
      { id: 'green', label: 'Green', value: '#10B981' }
    ];
    </script>
    
    <div class="relative inline-block">
      <button
        bind:this={triggerEl}
        class="px-4 py-2 text-gray-500 rounded outline-none"
        onclick={() => open = !open}
      >
      <SlidersHorizontal />
      </button>
    
      {#if open}
        <div
          bind:this={menuEl} 
          class="absolute z-10 w-64 bg-white shadow-lg rounded-md border border-gray-200 p-4"
          style="position: absolute;"
        >
          <div class="space-y-4">
            <!-- Input field -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Input Label</label>
              <input
                type="text"
                bind:value={inputValue}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text..."
              />
            </div>
    
            <!-- Color selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Color</label>
              <div class="space-y-2">
                {#each colors as color}
                  <label class="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="color"
                      value={color.id}
                      bind:group={selectedColor}
                      class="text-blue-500 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">{color.label}</span>
                    <div class="w-4 h-4 rounded-full" style="background-color: {color.value}"></div>
                  </label>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>