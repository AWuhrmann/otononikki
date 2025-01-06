<script lang="ts">
  import { page } from "$app/state"

  let { data } = $props();
</script>

<div class="values">
  {#if page.data.session && page.data.session.user && page.data.session.user.role === "admin"}
  <h1>{data.username}</h1>
{:else}
  <h1>Access Denied</h1>
{/if}

</div>