<script lang="ts">
  let { data } = $props();
</script>

<h1>{data.card.name}</h1>
<div class="values">
  {#each data.values as value}
    <div>
      {value.setting_name}: {value.value}
    </div>
  {/each}
</div>