<!-- App.svelte -->
<script>
    import Modal from "$components/Modal.svelte"

    let showModal = $state(false);
    let selectedOption = $state('option1');
  
    function closeModal() {
      showModal = false;
    }
  </script>
  
  <button onclick={() => showModal = true}>Open Modal</button>
  
  {#if showModal}
    <Modal 
      title="Select Options" 
      onClose={closeModal}
    >
      <div class="modal-form">
        <label>
          Select an option:
          <select bind:value={selectedOption}>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
        </label>
        
        <p>Selected option: {selectedOption}</p>
        
        <button onclick={closeModal}>
          Submit
        </button>
      </div>
    </Modal>
  {/if}