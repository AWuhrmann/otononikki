<script lang="ts">
  import { page } from "$app/state"
  import Card from "$components/cards/Card.svelte"
  import CardSettings from "$components/cards/CardSettings.svelte"
  import { getCards, load } from "$lib/card.svelte.js"
  import { onMount } from "svelte"
  
  let loading = $state(true)
  
  let { data } = $props();

  let cards = getCards();

  onMount(async () => {
    await load(data.username)
    loading = false
  })


  const menuItems = [
    {
      label: "Option 1",
      action: () => console.log("Option 1 clicked"),
    },
    {
      label: "Option 2",
      action: () => console.log("Option 2 clicked"),
    },
  ]
</script>

<button onclick={() => {console.log(cards)}}>print cards</button>

  <div class="layout">
    {#if page.data.session?.user?.role === "admin"}
      <div class="cards w-full flex-col flex flex-wrap items-center gap-4">
        <div class="flex justify-between w-[500px] mt-5">
          <h1 class="text-4xl font-bold">{data.username}</h1>
          <CardSettings />
        </div>
  
        {#if loading}
          <p>Loading cards...</p>
        {:else}
          {#each cards as card}
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