<!-- App.svelte -->
<script lang="ts">
  import Modal from "$components/Modal.svelte"
  import { RotateCcw, Timer, Grid2x2Plus, SquarePlus } from "lucide-svelte"

  import CardPreview from "./CardPreview.svelte"
  import ColorPicker from "./ColorPicker.svelte"

  let showModal = $state(false)
  let currentStep = $state(1)
  let name = $state("")
  let color = $state("")

  let type = $state("")

  let selected = $state("Counter")

  let enabled = false
  let minimumValue = 0

  let categories = [
    { name: "Counter", icon: RotateCcw },
    { name: "Timer", icon: Timer },
    { name: "Category", icon: Grid2x2Plus },
  ]

  function closeModal() {
    showModal = false
    currentStep = 1
    name = ""
    color = ""
  }

  function nextStep() {
    currentStep++
  }

  function previousStep() {
    currentStep--
  }

  async function handleSubmit() {
    console.log("Submitted:", { name, color })
    const response = await fetch(`/api/cards/new`, {
      method: "POST",
      body: JSON.stringify({
        name: name,
        color: color,
        type: type,
        settings: settings
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })

    //    closeModal()
  }

  // Define a type for our settings
  type Setting = {
    key: string
    label: string
    value: number
    enabled: boolean
    defaultValue?: number
  }

  // Store for all settings
  let settings = $state<Setting[]>([
    {
      key: "minimum",
      label: "Minimum",
      value: 0,
      enabled: false,
      defaultValue: 0,
    },
    {
      key: "maximum",
      label: "Maximum",
      value: 100,
      enabled: false,
      defaultValue: 100,
    },
    {
      key: "target",
      label: "Target",
      value: 50,
      enabled: false,
      defaultValue: 50,
    },
    // Easy to add more settings here
  ])

  // Toggle setting enabled state
  function toggleSetting(setting: Setting) {
    setting.enabled = !setting.enabled
    if (!setting.enabled) {
      setting.value = setting.defaultValue ?? 0
    }
  }
</script>

<button class="p-2" onclick={() => (showModal = true)}><SquarePlus/></button>

{#if showModal}
  <Modal title="Create new card" onClose={closeModal} nSteps={3} {currentStep}>
    {#snippet children({ currentStep })}
      {#if currentStep === 1}
        <div class="step">
          <h3>Step 1: Card name and types</h3>
          <input type="text" placeholder="Enter your name" bind:value={name} />

          <h3>What type of cards do you want ?</h3>
          <div class="categories-group flex-row">
            {#each categories as category}
              <label class="radio-button">
                <input
                  type="radio"
                  name="options"
                  value={category.name}
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
            <button class="primary" onclick={nextStep} disabled={!name}>
              Next
            </button>
          </div>
        </div>
      {:else if currentStep === 2}
        <div class="step">
          <div class="color-section">
            <ColorPicker bind:value={color} />
          </div>

          <div class="preview-section">
            <h4>Card Preview</h4>
            <CardPreview {name} {color} />
          </div>

          <div class="button-group">
            <button class="secondary" onclick={previousStep}
              >Previous step</button
            >
            <button class="primary" onclick={nextStep} disabled={!name}>
              Next
            </button>
          </div>
        </div>
      {:else if currentStep === 3}
        <div class="p-6 space-y-4 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-medium text-gray-800">Statistics Settings</h3>

          <div class="space-y-0">
            {#each settings as setting}
              <div
                class="flex items-center gap-4 p-4 rounded-lg justify-between"
              >
                <button
                  class="flex items-center gap-3 focus:outline-none"
                  onclick={() => toggleSetting(setting)}
                >
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200
                         {setting.enabled
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'}"
                  >
                    {#if setting.enabled}
                      <svg
                        class="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    {/if}
                  </div>

                  <span
                    class="text-sm font-medium {setting.enabled
                      ? 'text-blue-600'
                      : 'text-gray-700'}"
                  >
                    {setting.label}
                  </span>
                </button>
                <div class="w-24">
                  <input
                    type="number"
                    bind:value={setting.value}
                    disabled={!setting.enabled}
                    class="px-3 py-1.5 text-sm bg-white border rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="button-group">
          <button class="secondary" onclick={previousStep}>Previous step</button
          >
          <button class="primary" onclick={handleSubmit}> Submit </button>
        </div>
      {/if}
    {/snippet}
  </Modal>
{/if}

<style>
  .preview-section {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
  }

  .preview-section h4 {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    color: #64748b;
  }

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

  input,
  select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    font-size: 1rem;
  }

  .button {
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
