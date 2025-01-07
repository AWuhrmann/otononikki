<script lang="ts">

    import { CounterState } from "$lib/counter.svelte";

    import { CardState } from "$lib/card.svelte";

    import { Plus, Minus } from 'lucide-svelte'

    // let {counter = new CounterState(0), name = 'My buttons\' name',} = $props();

    let { card } = $props();

    function getValue() {    
        return card.values[card.values.length - 1]
    }

</script>

<div class="card">

    <div class="info">
        
        <p class="font-bold">
            {card.name}
        </p>
        
        <p class="">{getValue()}</p>

    </div>


    <div class="controls">

        <button class="button">
            <Plus/>
        </button>
        
        <button class="button">
            <Minus/>
        </button>
    </div>

</div>

<style>
    .card {
        border-radius: 10px;
        height: 100px;
        width: 500px;
        background-color: white;

        display:flex;
        justify-content: space-between;
    }

    .info {
        margin: auto 0;
        padding-left: 10px;

        font-family: Inter;
        font-size: 20px;
    }

    .controls {
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        padding-right: 10px;
    }

    .button {
        background-color: white;
        box-shadow: none;
        border: 0;
    }

    

    
</style>