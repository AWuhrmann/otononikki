<script lang="ts">
  import { page } from "$app/state"
  import Card from "$components/cards/Card.svelte"
  import CardSettings from "$components/cards/CardSettings.svelte"
  import { cards , load } from "$lib/card.svelte.js"
  import { onMount } from "svelte"
  
  let loading = $state(true)
  
  let { data } = $props();


  onMount(async () => {
    await load(data.username)
    loading = false
  })

</script>

<button onclick={() => {cards.value.pop(0)}}>print cards</button>

  <div class="layout">
    {#if page.data.session?.user?.role === "admin"}
      <div class="cards w-full flex-col flex flex-wrap items-center gap-4">
        <div class="flex justify-between w-[500px] mt-5">
          <h1 class="text-4xl font-bold">{data.username}</h1>
            <!-- <CardSettings /> -->
        </div>
  
        {#if loading}
          <p>Loading cards...</p>
        {:else}
          {#each $state.snapshot(cards).value as card}
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
