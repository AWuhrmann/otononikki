<script lang="ts">
    import { cardComponents } from '$lib/cardTypes';
    import type { CardState } from '$lib/card.svelte';
    import type { CardType } from '$lib/cardTypes';
  
    let { card = $bindable() } = $props<{ card: CardState }>();
    
    let CardComponent = $derived(cardComponents[card.settings.type as CardType] ?? cardComponents['default']);
  </script>
  
  {#if CardComponent}
    <CardComponent bind:card={card} />
  {:else}
    <div class="error">Unknown card type: {card.settings.type}</div>
  {/if} 