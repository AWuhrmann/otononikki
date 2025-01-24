<script lang="ts">
  import { page } from "$app/state"
  import Card from "$components/cards/Card.svelte"
  import CardSettings from "$components/cards/CardSettings.svelte"
    import Parent from "$components/Parent.svelte"

  let { data } = $props()
</script>

<div class="layout">
  {#if page.data.session && page.data.session.user && page.data.session.user.role === "admin"}
    <div class="cards w-full flex-col flex flex-wrap items-center gap-4">
      <div class="flex justify-between w-[500px] mt-5">
        <h1 class="text-4xl font-bold">{data.username}</h1>
        <CardSettings></CardSettings>
      </div>
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
