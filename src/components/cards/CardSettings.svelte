<!-- App.svelte -->
<script>
    import Modal from "$components/Modal.svelte"
    import { Heart, Star, Zap } from 'lucide-svelte'

    

  let showModal = $state(false);
  let currentStep = $state(1);
  let name = $state('');
  let color = $state('');

  let type = $state('');

  let selected = 'option1'

  let categories = [
    {name:'Counter',
    icon: Heart},
    {name:'Timer',
    icon: Star},
    {name:'Category',
    icon: Zap},
  ];

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
    title="Create new card" 
    onClose={closeModal}
    nSteps={3}
    currentStep={currentStep}
  >
    {#snippet children({ currentStep })}
      {#if currentStep === 1}
        <div class="step">
          <h3>Step 1: Card name and types</h3>
          <input 
            type="text" 
            placeholder="Enter your name"
            bind:value={name}
          />
          
          <h3>What type of cards do you want ?</h3>
          <div class="categories-group flex-row">
            {#each categories as category}
            <label class="radio-button">
              <input 
                type="radio" 
                name="options" 
                value="option1" 
                bind:group={selected}
              />
              <div class="content-cat">
                <category.icon size={20} />
                <span>{category.name}</span>
              </div>
            </label>
            {/each}
          </div>

          
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

.categories-group {
    display: flex;
    gap: 0.5rem;
  }

  .radio-button {
    cursor: pointer;
  }

  .radio-button input[type="radio"] {
    display: none;
  }

  .content-cat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }

  .radio-button input[type="radio"]:checked + .content-cat {
    background-color: #e2e8f0;
    border-color: #64748b;
  }

  .content-cat:hover {
    background-color: #f1f5f9;
  }

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