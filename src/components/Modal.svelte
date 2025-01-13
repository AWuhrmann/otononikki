<!-- Modal.svelte -->
<!-- Modal.svelte -->
<script>
  /** @type {{ title: string, onClose: () => void, currentStep: number, children?: import('svelte').Snippet }} */
  let { title, onClose, currentStep, children } = $props();
</script>

<div class="modal-backdrop">
  <div class="modal">
    <header>
      <h2>{title}</h2>
      <button class="close-button" onclick={onClose}>×</button>
    </header>
    
    <div class="modal-content">
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
      max-height: 80vh;
      overflow-y: auto;
    }
  
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
  
    h2 {
      margin: 0;
    }
  
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      padding: 0 8px;
    }
  
    .close-button:hover {
      opacity: 0.7;
    }
  
    .modal-content {
      /* Add any specific styling for the content area */
    }
  </style>