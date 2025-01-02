<!-- @migration-task Error while migrating Svelte code: `<button>` cannot be a descendant of `<button>`. The browser will 'repair' the HTML (by moving, removing, or inserting elements) which breaks Svelte's assumptions about the structure of your components.
https://svelte.dev/e/node_invalid_placement -->
<div class="stats-div">
  <button class="button-stats" data-type="counter" id="hair">
    <div class="stats-header-div">
      <h1 class="stats-header">Touching hair</h1>
      <p class="id-header"></p>
    </div>
    <div class="stats-interactive-div">
      <h1 class="count-text">0</h1>
    </div></button
  >
  <button
    class="button-stats"
    data-type="level"
    data-min="1"
    data-max="10"
    id="simple"
  >
    <div class="stats-header-div">
      <h1 class="stats-header">A simple level</h1>
      <p class="id-header"></p>
    </div>
    <div class="stats-interactive-div stats-type-level">
      <h1 class="level-text">5</h1>
      <!-- <button>Moins</button> -->
      <div class="why" role="button" tabindex="0">Plus</div>
    </div>
  </button>
  <button class="add-stats">Add stats</button>
</div>

<style>
  .stats-div {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 20px;
    align-items: center;
    margin-top: 20px;
  }

  .button-stats {
    padding: 10px;
    border-radius: 10px;
    background-color: #fafafa;
    width: 200px;
    /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
    border: 1px solid #ccc;
    box-shadow: none;
    transition: all 0.3s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    &:active {
      background-color: #f0f0f0;
    }
  }
</style>
