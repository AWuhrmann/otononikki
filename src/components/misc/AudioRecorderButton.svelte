<script lang="ts">
  import { Button } from "bits-ui";
  import { Ellipsis, Mic } from "lucide-svelte";
  
  export let onTranscriptionComplete: (transcription: string) => void;
  export let transcriptionEndpoint: string = "/api/transcribe";
  export let buttonClass: string = "";
  export let recordingClass: string = "";
  
  let isRecording = false;
  let isTranscribing = false;
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let startTime: number | null = null;
  let timerInterval: number | null = null;
  let elapsedTime = "0:00";
  
  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        isTranscribing = true;
        const audioBlob = new Blob(audioChunks, { type: "audio/mpeg-3" });
        const formData = new FormData();
        formData.append("audioFile", audioBlob, "audio.mp3");
        
        try {
          const response = await fetch(transcriptionEndpoint, {
            method: "POST",
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          onTranscriptionComplete(data.transcription);
        } catch (error) {
          console.error("Error during transcription:", error);
          onTranscriptionComplete("Error: Failed to transcribe audio");
        } finally {
          isTranscribing = false;
          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      isRecording = true;
      startTime = Date.now();
      
      // Update timer
      timerInterval = window.setInterval(() => {
        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          elapsedTime = formatTime(elapsed);
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      isRecording = false;
      
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  };
  
  const handleClick = () => {
    if (!isRecording && !isTranscribing) {
      startRecording();
    } else if (isRecording) {
      stopRecording();
    }
  };
  
  // Cleanup on component destroy
  import { onMount } from "svelte";
  onMount(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      if (isRecording) {
        stopRecording();
      }
    };
  });
</script>

<style>
  @keyframes minecraft-bob {
    0% {
      transform: scale(1) translateY(0);
    }
    50% {
      transform: scale(1.2) translateY(-2px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }
  
  :global(.mic-recording) {
    animation: minecraft-bob 2s ease-in-out infinite;
  }
</style>

<Button.Root
  class="{isRecording 
    ? 'bg-white text-red-500' 
    : 'text-gray-600 hover:bg-gray-100'} 
    rounded-input inline-flex
    h-9 items-center justify-center px-[11px]
    font-semibold active:scale-[0.98] transition-all disabled:opacity-40
    {buttonClass}"
  onclick={handleClick}
  disabled={isTranscribing}
>
  {#if isTranscribing}
    <Ellipsis size={16} />
  {:else}
    <Mic size={16} class="{isRecording ? 'mic-recording' : ''} w-4 h-4" />
  {/if}
</Button.Root>

<!-- class="flex text-gray-600 hover:bg-gray-100 rounded-md px-2 py-2"
><Sparkles size={16}></Sparkles></button
> -->
