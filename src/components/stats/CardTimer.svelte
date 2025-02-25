<script lang="ts">
  import { CardState, saveCard, updateCardProps } from "$lib/card.svelte";
  import { Play, Pause, RotateCcw } from "lucide-svelte";

  let { card } = $props();
  let card_: CardState = $state(structuredClone(card));
  let time: number = $state(0);
  let isRunning: boolean = $state(false);
  let intervalId: number | null = $state(null);

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function toggleTimer() {
    if (!isRunning) {
      intervalId = setInterval(() => {
        time += 1;
        saveCard(card, time);
      }, 1000) as unknown as number;
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
    isRunning = !isRunning;
  }

  function resetTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;
    time = 0;
    saveCard(card, time);
  }
</script>

<div
  class="flex items-center justify-between bg-white rounded-lg py-2 w-[500px] h-[150px] shadow-md"
>
  <div
    class="flex flex-col justify-start gap-[20px] pl-8 font-['Inter'] h-full w-full"
  >
    <p class="font-bold text-xl">{card_.name}</p>
    <div class="flex items-center justify-between pr-8">
      <p class="text-5xl font-mono">{formatTime(time)}</p>
      <div class="flex gap-4">
        <button
          class="rounded-full p-4 bg-gray-100 hover:bg-gray-200 transition-colors"
          onclick={toggleTimer}
        >
          {#if isRunning}
            <Pause size={24} />
          {:else}
            <Play size={24} />
          {/if}
        </button>
        <button
          class="rounded-full p-4 bg-gray-100 hover:bg-gray-200 transition-colors"
          onclick={resetTimer}
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  </div>
</div>
