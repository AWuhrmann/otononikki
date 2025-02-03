<script lang="ts">
  import { page } from "$app/state"
  import Card from "$components/cards/Card.svelte"
  import CardSettings from "$components/cards/CardSettings.svelte"
  import { getCards, load } from "$lib/card.svelte.js"
  import { createCounter } from "$lib/counter_test.svelte.ts"
  import { onMount } from "svelte"
  
  let loading = $state(true)
  
  const counter = createCounter();
  const counter_2 = createCounter();

  let { data } = $props();

  let cards = $state([]);

  onMount(async () => {
    await load(data.username)
    loading = false
  })

</script>


<button onclick={counter.increment}>
	clicks: {counter.count}
</button>
<p>{counter_2.count}</p>

<button onclick={() => {console.log(cards)}}>print cards</button>

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
