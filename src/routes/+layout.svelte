<script lang="ts">
  import Header from "$components/header.svelte"
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="w-full h-full">
  <Header />
  {@render children?.()}
</div>