<script lang="ts">
  import { page } from "$app/state"
  import Journal from "$components/Journal.svelte";
</script>

{#if page.data.session && page.data.session.user && page.data.session.user.role === "admin"}
  <h1>Otononikki</h1>
  <Journal />
{:else}
  <h1>Access Denied</h1>
{/if}
