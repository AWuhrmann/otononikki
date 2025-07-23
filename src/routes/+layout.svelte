<script lang="ts">
  import Header from "$components/base/header.svelte";
  import { SvelteToast } from '@zerodevx/svelte-toast'
  interface Props {
    children?: import("svelte").Snippet;
  }

  import "../app.css";

  let { children }: Props = $props();
</script>

<div class="w-full h-full">
  <SvelteToast />
  <Header />
  {@render children?.()}
</div>

