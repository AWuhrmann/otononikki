<script lang="ts">
    import { cardComponents } from '$lib/cardTypes';
    import type { CardState } from '$lib/card.svelte';
    import type { CardType } from '$lib/cardTypes';
  
    let { card } = $props<{ card: CardState }>();
    
    let CardComponent = $derived(cardComponents[card.type as CardType] ?? cardComponents['default']);
  </script>
  
  {#if CardComponent}
    <CardComponent {card} />
  {:else}
    <div class="error">Unknown card type: {card.type}</div>
  {/if} 