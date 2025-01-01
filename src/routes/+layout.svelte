<script lang="ts">
  import Header from "$components/header.svelte"
  import Footer from "$components/footer.svelte"
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="container">
  <Header />
  {@render children?.()}
</div>