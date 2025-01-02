<script lang="ts">
    import { page } from "$app/state"
    import CardCategories from "$components/cards/CardCategories.svelte"
    import Journal from "$components/Journal.svelte";
    import Stats from "$components/Stats.svelte"
  </script>
  
  {#if page.data.session && page.data.session.user && page.data.session.user.role === "admin"}
    <h1>Stats</h1>
    <Stats />

    <CardCategories />
  {:else}
    <h1>Access Denied</h1>
  {/if}
  