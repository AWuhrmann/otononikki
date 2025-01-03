<script lang="ts">
  import "../../app.css";

  import type { Snippet } from "svelte"
  import type { LayoutData } from "./$types"

  let { data, children }: { data: LayoutData; children: Snippet } = $props()
</script>

<div class="body">
  {@render children()}
</div>

<style>
  :global(body) {
    background-color: #e9edf4;
    margin: 0;
  }
</style>
