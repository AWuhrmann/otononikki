<script lang="ts">
  import { page } from "$app/state"
    import Card from "$components/cards/Card.svelte"

  let { data } = $props();
</script>

<div class="layout">
  {#if page.data.session && page.data.session.user && page.data.session.user.role === "admin"}
    <h1>{data.username}</h1>
    <div class="cards w-full flex flex-wrap justify-center gap-4">
      {#each data.cards as card}
        <div class="card">
          <Card {card} />
        </div>
      {/each}
    </div>
  {:else}
    <h1>Access Denied</h1>
  {/if}
</div>