<script lang="ts">
  import type { Snippet } from "svelte"
  import type { LayoutData } from "./$types"

  let { data, children }: { data: LayoutData; children: Snippet } = $props()
</script>

<div class="body">
  {@render children()}
</div>

<style>
  :global(body) {
    background-color: #f0f0f0;
    margin: 0;
  }
</style>
