<!-- App.svelte -->
<script>
    import Modal from "$components/Modal.svelte"


  let showModal = $state(false);
  let currentStep = $state(1);
  let name = $state('');
  let color = $state('');

  function closeModal() {
    showModal = false;
    currentStep = 1;
    name = '';
    color = '';
  }

  function nextStep() {
    currentStep++;
  }

  function previousStep() {
    currentStep--;
  }

  function handleSubmit() {
    console.log('Submitted:', { name, color });
    closeModal();
  }
</script>

<button onclick={() => showModal = true}>Open Modal</button>

{#if showModal}
  <Modal 
    title="Profile Setup" 
    onClose={closeModal}
    {currentStep}
  >
    {#snippet children({ currentStep })}
      {#if currentStep === 1}
        <div class="step">
          <h3>Step 1: Enter Your Name</h3>
          <input 
            type="text" 
            placeholder="Enter your name"
            bind:value={name}
          />
          
          <div class="button-group">
            <button class="secondary" onclick={closeModal}>Cancel</button>
            <button 
              class="primary" 
              onclick={nextStep}
              disabled={!name}
            >
              Next
            </button>
          </div>
        </div>

      {:else if currentStep === 2}
        <div class="step">
          <h3>Step 2: Choose Your Favorite Color</h3>
          <select bind:value={color}>
            <option value="">Select a color...</option>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="purple">Purple</option>
          </select>

          <div class="summary">
            <p>Name: {name}</p>
          </div>
          
          <div class="button-group">
            <button class="secondary" onclick={previousStep}>Back</button>
            <button 
              class="primary"
              onclick={handleSubmit}
              disabled={!color}
            >
              Submit
            </button>
          </div>
        </div>
      {/if}
    {/snippet}
  </Modal>
{/if}

<style>
  .step {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
  }

  input, select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    font-size: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    min-width: 100px;
  }

  button.primary {
    background: #0066cc;
    color: white;
  }

  button.secondary {
    background: #e0e0e0;
    color: #333;
  }

  button:hover:not(:disabled) {
    opacity: 0.9;
  }

  button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }

  h3 {
    margin: 0;
  }

  .summary {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .summary p {
    margin: 0;
  }
</style>