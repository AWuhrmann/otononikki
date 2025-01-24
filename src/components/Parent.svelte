<script lang="ts">
    import { CardState } from "$lib/card.svelte"
    import Children from "./Children.svelte"


    let { herited } = $props();

</script>

<p>
    {herited.name}, {herited.id}
</p>

<Children bind:herited={herited}></Children>