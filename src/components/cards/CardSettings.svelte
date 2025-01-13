<!-- App.svelte -->
<script>
    import Modal from "$components/Modal.svelte"


  let showModal = $state(false);
  let currentStep = $state(1);
  let selectedOption = $state('');
  let selectedSubOption = $state('');
  let finalDetails = $state('');

  function closeModal() {
    showModal = false;
    currentStep = 1;
    selectedOption = '';
    selectedSubOption = '';
    finalDetails = '';
  }

  function nextStep() {
    currentStep++;
  }

  function previousStep() {
    currentStep--;
  }
</script>

<button onclick={() => showModal = true}>Open Multi-Step Modal</button>

{#if showModal}
  <Modal 
    title="Multi-Step Form" 
    onClose={closeModal}
    {currentStep}
  >
    {#snippet content({ currentStep })}
      {#if currentStep === 1}
        <div class="step">
          <h3>Step 1: Choose Option</h3>
          <select bind:value={selectedOption}>
            <option value="">Select an option...</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>

          <div class="button-group">
            <button onclick={closeModal}>Cancel</button>
            <button 
              onclick={nextStep} 
              disabled={!selectedOption}
            >
              Next
            </button>
          </div>
        </div>

      {:else if currentStep === 2}
        <div class="step">
          <h3>Step 2: Choose Sub-Option</h3>
          <select bind:value={selectedSubOption}>
            <option value="">Select a sub-option...</option>
            {#if selectedOption === 'option1'}
              <option value="sub1">Sub-Option 1A</option>
              <option value="sub2">Sub-Option 1B</option>
            {:else if selectedOption === 'option2'}
              <option value="sub3">Sub-Option 2A</option>
              <option value="sub4">Sub-Option 2B</option>
            {:else}
              <option value="sub5">Sub-Option 3A</option>
              <option value="sub6">Sub-Option 3B</option>
            {/if}
          </select>

          <div class="button-group">
            <button onclick={previousStep}>Back</button>
            <button 
              onclick={nextStep}
              disabled={!selectedSubOption}
            >
              Next
            </button>
          </div>
        </div>

      {:else if currentStep === 3}
        <div class="step">
          <h3>Step 3: Final Details</h3>
          <textarea 
            bind:value={finalDetails}
            placeholder="Enter any additional details..."
          ></textarea>

          <div class="summary">
            <p>Selected Option: {selectedOption}</p>
            <p>Selected Sub-Option: {selectedSubOption}</p>
          </div>

          <div class="button-group">
            <button onclick={previousStep}>Back</button>
            <button 
              onclick={() => {
                console.log({
                  selectedOption,
                  selectedSubOption,
                  finalDetails
                });
                closeModal();
              }}
              disabled={!finalDetails}
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
    gap: 1.5rem;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }

  select, textarea {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }

  .summary {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: #0066cc;
    color: white;
    cursor: pointer;
  }

  button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    background: #0052a3;
  }
</style>