<script lang="ts">
  import Header from "$components/base/header.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { page } from '$app/state';
  interface Props {
    children?: import("svelte").Snippet;
  }

  import "../app.css";
    import { onMount } from "svelte";

  let { children }: Props = $props();

  let isHeader: boolean = $state(page.route.id === ' /');
</script>

<style>
  :root {
    --toastBackground: white;
    --toastColor: rgb(71, 71, 71);
    --toastContainerTop: 8rem;
    --toastContainerRight: auto;
    --toastContainerBottom: auto;
    --toastContainerLeft: 4rem;
  }

  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>

<div class="w-full h-screen flex flex-col">
  <main class="flex-1 flex flex-col min-h-0">
    {@render children?.()}
  </main>
</div>
