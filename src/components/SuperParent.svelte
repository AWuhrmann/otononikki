<script lang="ts">
    import { CardState } from "$lib/card.svelte"
    import Children from "./Children.svelte"
    import Parent from "./Parent.svelte"


    let component = $state(new CardState({
        name: 'test',
        id: 0,
    }))

</script>

<p>
    {component.name}, {component.id}
</p>

<Parent herited={component}></Parent>