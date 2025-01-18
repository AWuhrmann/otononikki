<!-- ColorPicker.svelte -->
<script>
    /** @type {string} */
    let { value = $bindable('') } = $props();
  
    const colors = [
      { id: 'red', value: '#EF4444', name: 'Red' },
      { id: 'blue', value: '#3B82F6', name: 'Blue' },
      { id: 'green', value: '#10B981', name: 'Green' },
      { id: 'purple', value: '#8B5CF6', name: 'Purple' },
      { id: 'orange', value: '#F59E0B', name: 'Orange' },
      { id: 'pink', value: '#EC4899', name: 'Pink' }
    ];
  </script>
  
  <div class="color-picker">
    {#each colors as color}
      <label class="color-option">
        <input 
          type="radio" 
          name="color" 
          value={color.value}
          bind:group={value}
        />
        <div 
          class="color-swatch" 
          style:background-color={color.value}
          title={color.name}
        >
          {#if value === color.value}
            <svg 
              class="checkmark" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="3" 
              stroke-linecap="round" 
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          {/if}
        </div>
        <span class="color-name">{color.name}</span>
      </label>
    {/each}
  </div>
  
  <style>
    .color-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 0.5rem 0;
    }
  
    .color-option {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
  
    .color-option input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
  
    .color-swatch {
      width: 3rem;
      height: 3rem;
      border-radius: 0.75rem;
      border: 3px solid transparent;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    .color-option input:checked + .color-swatch {
      border-color: #fff;
      box-shadow: 0 0 0 2px currentColor;
    }
  
    .color-option:hover .color-swatch {
      transform: scale(1.1);
    }
  
    .checkmark {
      width: 1.5rem;
      height: 1.5rem;
      color: white;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));
    }
  
    .color-name {
      font-size: 0.875rem;
      color: #4b5563;
    }
  </style>