<script lang="ts">
  import { onMount } from "svelte";

  interface testAPI {
    myFunc: () => void;
  }

  let { onReady = (api: testAPI) => {} } = $props();

  let api: testAPI = { myFunc: hi };

  onMount(() => {
    onReady(api);
  });

  let n = $state(0);

  function hi() {
    console.log("hi from Dummy ! " + n);
  }
</script>

<button onclick={() => (n += 1)}>Augment here</button>
