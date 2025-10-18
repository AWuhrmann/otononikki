// TestAudioRecorder.svelte
<script lang="ts">
  import AudioRecorderButton from "$components/misc/AudioRecorderButton.svelte";
  
  let content = "";
  let appendMode = true; // Toggle between append and replace mode
  
  const handleTranscription = (transcription: string) => {
    if (appendMode && content) {
      // Append with a space or newline
      content = content + "\n\n" + transcription;
    } else {
      // Replace content
      content = transcription;
    }
  };
  
  // Mock API endpoint for testing
  // In production, replace this with your actual endpoint
  const mockTranscriptionEndpoint = "/api/transcribe";
</script>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: Arial, sans-serif;
  }
  
  .editor-section {
    background: #f5f5f5;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    color: #333;
    margin-bottom: 1.5rem;
  }
  
  .controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .mode-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 14px;
    color: #666;
  }
  
  .mode-toggle input {
    cursor: pointer;
  }
  
  textarea {
    width: 100%;
    min-height: 300px;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  }
  
  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .info {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #e0f2fe;
    border-radius: 6px;
    font-size: 14px;
    color: #0369a1;
  }
</style>

<div class="container">
  <div class="editor-section">
    <h1>Audio Transcription Editor</h1>
    
    <div class="controls">
      <AudioRecorderButton 
        onTranscriptionComplete={handleTranscription}
        transcriptionEndpoint={mockTranscriptionEndpoint}
      />
      
      <div class="mode-toggle">
        <label>
          <input 
            type="checkbox" 
            bind:checked={appendMode}
          />
          Append mode (unchecked = replace)
        </label>
      </div>
    </div>
    
    <textarea
      bind:value={content}
      placeholder="Your transcribed text will appear here..."
    />
    
    <div class="info">
      <strong>How to use:</strong>
      <ul>
        <li>Click "Record" to start recording audio</li>
        <li>Click the timer to stop recording</li>
        <li>Wait for transcription to complete</li>
        <li>Toggle "Append mode" to either add to or replace existing text</li>
      </ul>
    </div>
  </div>
</div>