<script lang="ts">
  import Header from "$components/base/header.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { page } from '$app/state';
  interface Props {
    children?: import("svelte").Snippet;
  }

  import "../../app.css";
  let { children }: Props = $props();

</script>

<div class="w-full h-screen flex flex-col">
  <Header />
  <SvelteToast />
  <main class="flex-1 flex flex-col min-h-0">
    {@render children?.()}
  </main>
</div>
