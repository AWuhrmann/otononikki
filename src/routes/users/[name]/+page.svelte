<script lang="ts">
  import { page } from "$app/state";
  import Card from "$components/stats/Card.svelte";
  import CardNewModal from "$components/stats/CardNewModal.svelte";
  import { cards, load } from "$lib/card.svelte.js";
  import { onMount } from "svelte";

  let loading = $state(true);

  let { data } = $props();

  let showAll = $state(false);

  onMount(async () => {
    await load(data.username);
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
        <button
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition-colors duration-300"
          onclick={() => {
            console.log($cards);
          }}>print cards</button
        >
      </div>

      {#if loading}
        <p>Loading cards...</p>
      {:else}
        {#each $cards.filter((card) => {
          if (showAll) return true;

          const validatedAt = card.settings.validated_at;
          if (!validatedAt) return true;

          const validatedDate = new Date(Number(validatedAt)).toLocaleDateString();

          const today = new Date().toLocaleDateString();

          return validatedDate !== today;
        }) as card (card.id)}
          <div class="card">
            <Card {card} />
          </div>
        {/each}
      {/if}
    </div>
  {:else}
    <h1>Access Denied</h1>
  {/if}
</div>
