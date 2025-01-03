<script lang="ts">
  import { page } from "$app/state"
  import BasicCounter from "$components/cards/BasicCounter.svelte"
</script>

<div class="page">
  {#if page.data.session && page.data.session.user && page.data.session.user.role === "admin"}
    <h1>Stats</h1>
    <div class="stats-container">
      <BasicCounter />
    </div>
  {:else}
    <h1>Access Denied</h1>
  {/if}
</div>

<style>

  .stats-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
