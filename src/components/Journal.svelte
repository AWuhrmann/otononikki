<script lang='ts' >

  import Card from './Card.svelte';

  import { onMount } from 'svelte';
  let contacts = [];

  onMount(async () => {
    const response = await fetch('/contacts');
    if (response.ok) {
      contacts = await response.json();
      console.log(contacts)
    } else {
      console.error("Failed to load contacts");
    }
  });

  type AudioState = {
    isRunning: boolean;
    startTime: number | null;
    timerInterval: number | null;
    mediaRecorder: MediaRecorder | null;
    audioChunks: Blob[];
  };

  // Props
  export let onTranscriptionComplete: (transcription: string) => void = () => {};

  // State
  let recordButton: HTMLButtonElement;
  let transcriptBox: HTMLTextAreaElement;
  let state: AudioState = {
    isRunning: false,
    startTime: null,
    timerInterval: null,
    mediaRecorder: null,
    audioChunks: []
  };

  // Format time for display
  const formatTime = (elapsedTime: number): string => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.mediaRecorder = new MediaRecorder(stream);
      state.audioChunks = [];

      state.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        state.audioChunks.push(event.data);
      };

      state.mediaRecorder.onstop = async () => {
        const selectedContacts = Array.from(
          document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked')
        ).map(input => `[[${input.value}]]`).join(', ');

        const audioBlob = new Blob(state.audioChunks, { type: 'audio/mpeg-3' });
        const formData = new FormData();
        formData.append('audioFile', audioBlob, 'audio.mp3');
        formData.append('contacts', selectedContacts);

        try {
          const response = await fetch('/transcribe', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          transcriptBox.value = data.transcription;
          recordButton.innerHTML = 'Record';
          onTranscriptionComplete(data.transcription);
        } catch (error) {
          console.error('Error during transcription:', error);
          recordButton.innerHTML = 'Error';
        }
      };

      state.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      recordButton.innerHTML = 'Error';
    }
  };

  const stopRecording = () => {
    if (state.mediaRecorder) {
      state.mediaRecorder.stop();
    }
  };

  const handleRecord = async () => {
    if (!state.isRunning && recordButton.innerHTML !== 'Record') {
      // Start recording
      await startRecording();
      state.isRunning = true;
      state.startTime = Date.now();
      recordButton.innerHTML = '0:00';

      state.timerInterval = window.setInterval(() => {
        if (state.startTime) {
          const elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
          recordButton.innerHTML = formatTime(elapsedTime);
        }
      }, 1000);
    } else {
      // Stop recording
      stopRecording();
      state.isRunning = false;
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
      recordButton.innerHTML = 'Transcribing...';
    }
  };

  onMount(() => {
    return () => {
      // Cleanup on component destruction
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
      if (state.mediaRecorder && state.isRunning) {
        stopRecording();
      }
    };
  });
</script>

<div class="left-panel">
    <textarea class="textarea" id="transcriptBox" bind:this={transcriptBox} rows="10" cols="50"
    placeholder="Transcription will appear here..."></textarea>
    <!-- Add more text or content here as needed -->
</div>
<div class="middle-box" id="search-box-div">
    <ul id="tag-list">
        <input type="text" id="search-box" data-user-option-allowed="true" class="search-box"
            placeholder="Search contacts..." onkeyup="filterContacts()">
    </ul>
    <div class="menu-buttons">
        <button id="record-note" on:click={handleRecord} bind:this={recordButton}> Record </button>
        <button id="add-image"> Add image </button>
    <button id="upload-note" on:click={handleRecord}> Upload </button>
    </div>
</div>
<div class="right-panel">
    <div class="list-cards" id="checkbox-list">
        {#each contacts as contact}
            <Card name={contact.name} picture={contact.picture} />
        {/each}
    </div>
</div>

<style>
    
.left-panel {
    flex-grow: 0;
    flex-shrink: 2;
    /* Adjust width as needed */
    background: #ffffff;
    justify-content: center;
    border-radius: 32px;
    border: 2px solid rgba(148, 148, 148, 0.2);

    /* Ensure content in left panel can scroll if it overflows */
    font-size: 24px;
    /* Adjust the font size as needed */
    font-weight: bold;
    padding: 30px;
    margin: 20px;
    margin-top: 0px;
}

.textarea {
    background: transparent;
    border: none;
    width: 100%;
    font-family: "Inter", Arial;
    font-size: 24px;
}

.right-panel {
    display: flex;
    flex: 1;
    background: #ffffff;
    height: calc(100vh - 660px);
    flex-direction: column;
}

.middle-box {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    overflow-x: hidden; /* Prevent horizontal scrolling */
    padding-left: 20px;  /* Add left padding */
    padding-right: 20px; /* Add right padding */
}

.middle-box ul {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    border: 2px solid rgba(189, 189, 189, 0.2);
    border-radius: 12px;
    box-sizing: border-box;
    margin: 10px 0px; /* Remove horizontal margin */
    padding: 7px;
    width: 100%;
    /* max-width: 100%;  */
}

.menu-buttons{
    display: flex;
    flex-direction: row;
}

.menu-buttons button{    
    border-radius: 20px;
    box-sizing: border-box;
    margin: 20px 5px;
    padding: 7px;
    font-size: 24px; 
    transition: 0.2s;
}
.menu-buttons button:active {
    transform: scale(.9);
}

#record-note{
    background-color: rgb(255, 187, 187);
    border: 3px solid rgb(177, 64, 64);
}

#record-note:hover{
    background-color: rgb(255, 140, 140);
}

#upload-note{
    background-color: rgb(187, 211, 255);
    border: 3px solid rgb(114, 124, 255);
}
#upload-note:hover{
    background-color: rgb(164, 196, 255);
}

#add-image{
    white-space: nowrap;
    background-color: rgb(197, 255, 195);
    border: 3px solid rgb(101, 221, 94);
}
#add-image:hover{
    background-color: rgb(158, 255, 155);
}

.middle-box ul li {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 4px 3px;
    padding: 5px 5px 5px 5px;
    background: #e1f1ff;
    border: 2px solid #0082ff;
    border-radius: 10px;
    font-size: 24px;
}

.middle-box ul li i 
{
    display: flex;
    align-items: center;
    height: 30px;
    width: 20px;
}

.search-box {
    font-family: "Inter", Arial;
    display: flex;
    align-items: center;
    flex: 2;
    width: 100%;
    border: none;
    outline: none;
    padding: 12px;
    font-size: 24px;
    height: 50px;
    box-sizing: border-box; /* Include padding in the width calculation */
}

.search-box li {
    font-size: 32px;
    font-family: "Inter" Arial;
}

.selected-tag {
    background: #ffcccc !important;
    /* Light red background */
    border-color: #ff0000 !important;
    /* Red border */
}

.grid .fa-times {
    margin-left: 8px;
}

.list-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    /* grid-auto-rows: max-content; */
    gap: 10px;
    height: 500px;
    overflow-y: auto;
    padding-top: 20px; 
    padding-bottom: 20px; 
    padding-left: 5px;
    padding-right: 5px;
}
</style>