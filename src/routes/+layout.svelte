<script lang="ts">
  import Header from "$components/base/header.svelte";
  interface Props {
    children?: import("svelte").Snippet;
  }

  import "../app.css";

  let { children }: Props = $props();
</script>

<div class="w-full h-full">
  <Header />
  {@render children?.()}
</div>

