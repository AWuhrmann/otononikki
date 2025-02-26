<script lang="ts">
  import { CardState, saveCard, updateCardProps } from "$lib/card.svelte";
  import { Play, Pause, RotateCcw, CalendarCheck } from "lucide-svelte";

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
    class="flex flex-col justify-start gap-[20px] pl-4 font-['Inter'] h-full w-full"
  >
    <div>
      <p class="font-bold text-xl">{card_.name}</p>
      <button class="text-gray-400" onclick={() => console.log(card.settings)}
        >{card_.name}</button
      >
    </div>
    <div class="flex items-center justify-between pr-8">
      <p class="text-4xl">{formatTime(time)}</p>
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

  <div class="flex flex-col items-center pr-2 h-full">
    <button class="bg-white border-0 shadow-none"><CalendarCheck /></button>
  </div>
</div>
