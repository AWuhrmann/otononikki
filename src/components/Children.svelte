<script lang="ts">
    let {herited = $bindable()} = $props(); 
</script>

<input bind:value={herited.name}>
<p>
    {herited.name}, {herited.id}
</p>