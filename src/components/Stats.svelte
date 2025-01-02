<script lang="ts">
    import { onDestroy } from "svelte"
    
    let count = $state(0);
    let isRunning = $state(false);
    let timer = $state(0);
    let intervalId: ReturnType<typeof setInterval> | undefined;
    
    function increment(): void {
      count += 1;
    }
    
    function startTimer(): void {
      if (!isRunning) {
        isRunning = true;
        intervalId = setInterval(() => {
          timer += 1;
        }, 1000);
      }
    }
    
    function stopTimer(): void {
      if (isRunning && intervalId) {
        isRunning = false;
        clearInterval(intervalId);
        intervalId = undefined;
      }
    }
    
    function reset(): void {
      count = 0;
      timer = 0;
      stopTimer();
    }
    
    // Clean up interval when component is destroyed
    onDestroy(() => {
      if (intervalId) clearInterval(intervalId);
    });
    
    // Format timer to MM:SS
    let formatted_time = $derived.by(() => {
      const minutes: number = Math.floor(timer / 60);
      const seconds: number = timer % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });
</script>

<div class="stats-div">
  <div class="button-stats" data-type="counter" id="hair">
    <div class="stats-header-div">
      <h1 class="stats-header">Touching hair</h1>
      <p class="id-header"></p>
    </div>
    <div class="stats-interactive-div">
      <h1 class="count-text">{count}</h1>
      <p class="timer-text">{formatted_time}</p>
    </div>
    <div class="button-group">
      <button onclick={increment}>Increment</button>
      <button onclick={isRunning ? stopTimer : startTimer}>
        {isRunning ? "Stop" : "Start"} Timer
      </button>
      <button onclick={reset}>Reset</button>
    </div>
  </div>
</div>

<style>
  .stats-div {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 20px;
    align-items: center;
    margin-top: 20px;
  }

  .button-stats {
    padding: 10px;
    border-radius: 10px;
    background-color: #fafafa;
    width: 200px;
    border: 1px solid #ccc;
    box-shadow: none;
    transition: all 0.3s;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    &:active {
      background-color: #f0f0f0;
    }
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .timer-text {
    font-size: 1.2rem;
    margin: 8px 0;
  }

  .stats-interactive-div {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
