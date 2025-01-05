<script lang="ts">
  import { CardState } from '$lib/card.svelte';
    import { onMount } from 'svelte'
  
  let { card = new CardState() } = $props();

  onMount(() => {
    console.log(card);
  });
</script>

<div class="card">
  <h2>{card.name}</h2>
  
  <div class="settings">
    {#each Object.entries(card.settings) as [name, setting]}
      <div class="setting">
        <label>{name}</label>
        {#if setting.type === 'number'}
          <input 
            type="number" 
            value={card.values[name] ?? setting.default}
            onchange={(e) => card.setValue(name, Number(e.target.value))}
          />
        {:else}
          <input 
            type="text" 
            value={card.values[name] ?? setting.default}
            onchange={(e) => card.setValue(name, e.target.value)}
          />
        {/if}
      </div>
    {/each}
  </div>

  <button onclick={() => card.save()}>Save Changes</button>
</div>

<style>
  .card {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .settings {
    display: grid;
    gap: 1rem;
    margin: 1rem 0;
  }

  .setting {
    display: grid;
    gap: 0.5rem;
  }
</style>