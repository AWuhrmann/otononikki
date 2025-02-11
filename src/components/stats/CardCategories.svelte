<script lang="ts">
  let categories = $state([
    { id: "hair", name: "Hair Touching", selected: true },
    { id: "scratch", name: "Scratching", selected: false },
    { id: "face", name: "Face Touching", selected: false },
    { id: "neck", name: "Neck Cracking", selected: false },
  ])

  let activeCategory = $derived(
    categories.find((cat) => cat.selected)?.name ?? "No category selected",
  )

  function selectCategory(selectedId: string): void {
    categories = categories.map((category) => ({
      ...category,
      selected: category.id === selectedId,
    }))
  }
</script>

<div class="category-container">
  <div class="category-selector">
    {#each categories as category}
      <button
        class="category-button"
        class:selected={category.selected}
        onclick={() => selectCategory(category.id)}
      >
        {category.name}
      </button>
    {/each}
  </div>

  <div class="active-category">
    <h2>Currently tracking: {activeCategory}</h2>
  </div>
</div>

<style>
  .category-container {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  .category-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
  }

  .category-button {
    padding: 12px;
    border: 2px solid #ccc;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1rem;
  }

  .category-button:hover {
    background: #f0f0f0;
  }

  .category-button.selected {
    background: #4a90e2;
    color: white;
    border-color: #357abd;
  }

  .active-category {
    text-align: center;
    padding: 20px;
    background: #f8f8f8;
    border-radius: 8px;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
</style>
