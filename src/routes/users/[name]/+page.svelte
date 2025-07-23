<script lang="ts">
  import { page } from "$app/state";
  import Card from "$components/stats/Card.svelte";
  import CardNewModal from "$components/stats/CardNewModal.svelte";
  import { cardStore } from "$lib/card.svelte.js";
  import { onMount } from "svelte";

  let loading = $state(true);

  let { data } = $props();

  let showAll = $state(false);

  onMount(async () => {
    await cardStore.load(data.username);
    loading = false;
  });
</script>

<div class="layout">
  {#if page.data.session?.user?.role === "admin"}
    <div class="cards w-full flex-col flex flex-wrap items-center gap-4 mb-10">
      <div class="flex justify-between w-[500px] mt-5">
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
      </div>

      {#if loading}
        <p>Loading cards...</p>
      {:else}
        {#each cardStore.cards.value.filter((card) => {
          if (showAll) return true;
          // Check whether the we are showing all the cards or only the one not yet completed today.

          const validatedAt = card.settings.validated_at;
          if (!validatedAt) return true;

          const validatedDate = new Date(Number(validatedAt)).toLocaleDateString();

          const today = new Date().toLocaleDateString();

          return validatedDate !== today;
        }) as card (card.id)}
          <div class="card">
            <Card bind:card={cardStore.cards.value[cardStore.cards.value.findIndex((c) => (c.id === card.id))]} />
          </div>
        {/each}
      {/if}
    </div>
  {:else}
  <!-- Fallback page, in case user not yet signed in -->
    <h1>You need to sign in first.</h1>
  {/if}
</div>
