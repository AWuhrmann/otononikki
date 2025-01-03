<script lang="ts">

    import { CounterState } from "$lib/counter.svelte";

    let {counter = new CounterState(0), name = 'My buttons\' name'} = $props();

</script>

<div class="button">

    {name}

    <button onclick={() => counter.increment()}>
        Increment
    </button>

    <button onclick={() => counter.decrement()}>
        Decrement
    </button>

    {counter.value}
</div>

<style>
    .button {
        height: 100px;
        width: 300px;
        background-color: lightgray;
    }
    
</style>