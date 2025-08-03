<script lang="ts">
  import { page } from "$app/state";
  import CardController from "$components/stats/CardController.svelte";
</script>

<style>
  .stats-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>

<div class="page">
  {#if page.data.session && page.data.session.user && page.data.session.user.role === "admin"}
    <h1>Stats</h1>
    <div class="stats-container">
      <CardController />
    </div>
  {:else}
    <h1>Access Denied</h1>
  {/if}
</div>
