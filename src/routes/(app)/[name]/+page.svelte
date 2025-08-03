<script lang="ts">
  import { page } from "$app/state";
  import Card from "$components/stats/Card.svelte";
  import CardNewModal from "$components/stats/CardNewModal.svelte";
  import { CardState, cardStore } from "$lib/card.svelte.js";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { cubicOut } from "svelte/easing";

  import { GripVertical } from "lucide-svelte";

  import { draggable, droppable, type DragDropState } from "@thisux/sveltednd";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";

  let loading = $state(true);

  let { data } = $props();

  let showAll = $state(false);

  let cards = $derived.by(() => cardStore.cards.value);

  function handleDrop(state: DragDropState<CardState>) {
    const { draggedItem, targetContainer } = state;
    const dragIndex = cards.findIndex(
      (item: CardState) => item.id === draggedItem.id,
    );
    const dropIndex = parseInt(targetContainer ?? "0");

    if (dragIndex !== -1 && !isNaN(dropIndex)) {
      const [item] = cards.splice(dragIndex, 1);
      cards.splice(dropIndex, 0, item);
    }
  }

  onMount(async () => {
    await cardStore.load(data.username);
    loading = false;
  });
</script>

<style>
  .section-dnd {
    width: 50%;
    padding: 0.3em;
    border: 1px solid black;
    /* this will allow the dragged element to scroll the list although starting in version 0.9.41 the lib would detect any scrollable parent*/
    overflow: scroll;
    height: 200px;
  }
  .div-dnd {
    width: 50%;
    padding: 0.2em;
    border: 1px solid blue;
    margin: 0.15em 0;
  }
</style>

<div class="layout">
  {#if page.data.session?.user?.role === "admin"}
    <div class="cards w-full flex-col flex flex-wrap items-center gap-4 mb-10">
      <div class="flex justify-between w-[600px] mt-5">
        <h1 class="text-4xl font-bold">{data.username}</h1>
        <CardNewModal />
      </div>

      <div class="flex gap-10">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300"
          onclick={() => (showAll = !showAll)}
        >
          {showAll ? "Show Today" : "Show All"}
        </button>
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300"
        >
          Add toast
        </button>
      </div>
      {#if loading}
        <p>Loading cards...</p>
      {:else}
        {#each cards.filter((card) => {
          if (showAll) return true;
          // Check whether the we are showing all the cards or only the one not yet completed today.

          if (!card.settings) {
            return true;
          }

          const validatedAt = card.settings.validated_at;
          if (!validatedAt) return true;

          const validatedDate = new Date(Number(validatedAt)).toLocaleDateString();

          const today = new Date().toLocaleDateString();

          return validatedDate !== today;
        }) as card, index (card.id)}
        <div animate:flip={{ duration: 400, easing: cubicOut }}
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 200 }} class="flex flex-row">
        <div
        use:draggable={{ container: index.toString(), dragData: card, interactive: ['.interactive'] }}
        use:droppable={{
              container: index.toString(),
              callbacks: { onDrop: handleDrop },
              attributes: {
                // draggingClass: 'scale-105 rotate-2 !shadow-2xl !ring-2 ring-blue-500/50 z-50',
                // dragOverClass: 'scale-98 -rotate-1 !shadow-inner !ring-2 ring-emerald-500/50'
              },
            }}
            
            class="group relative cursor-move ring-1 ring-white/60
        transition-all duration-500
        ease-out active:shadow-inner flex items-center justify-center px-4"
        >
            <GripVertical class="text-gray-500 w-500"/>
            <div class="card">
              <Card bind:card={cards[cards.findIndex((c) => c.id === card.id)]} />
              </div>
          </div>
          </div>
        {/each}
      {/if}
    </div>
  {:else}
    <!-- Fallback page, in case user not yet signed in -->
    <h1>You need to sign in first.</h1>
  {/if}
</div>
