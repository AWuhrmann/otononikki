<!-- Modal.svelte -->
<script>
  /** @type {{ 
    title: string, 
    onClose: () => void, 
    nSteps: number,
    currentStep: number, 
    children?: import('svelte').Snippet<[{ currentStep: number }]>
  }} */
  let { title, onClose, nSteps, currentStep, children } = $props();
</script>

<div class="modal-backdrop">
  <div class="modal">
    <header>
      <h2>{title}</h2>
      <button class="close-button" onclick={onClose}>×</button>
    </header>
    
    <div class="modal-content">
      <div class="progress-bar">
        {#each {length: nSteps}, i}
          <div class="step-indicator" class:active={currentStep >= i+1}>{i+1}</div>
        {/each}
      </div>
      {@render children?.({ currentStep })}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 4px;
    padding: 20px;
    width: 80%;
    max-width: 500px;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }

  .progress-bar {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
  }

  .step-indicator {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .step-indicator.active {
    background: #0066cc;
    color: white;
  }
</style>