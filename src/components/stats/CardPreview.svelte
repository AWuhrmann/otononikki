<!-- CardPreview.svelte -->
<script>
    /** @type {{ name: string; color: string; }} */
    let { name, color } = $props();
    
    // Generate random data for the chart
    let data = [
      { month: 'Jan', value: Math.random() * 100 },
      { month: 'Feb', value: Math.random() * 100 },
      { month: 'Mar', value: Math.random() * 100 },
      { month: 'Apr', value: Math.random() * 100 }
    ];
  
    // Calculate the max value for scaling
    let maxValue = Math.max(...data.map(d => d.value));
  </script>
  
  <div class="card-preview">
    <div class="card-header">
      <h3>{name || 'Preview'}</h3>
    </div>
    
    <div class="chart">
      {#each data as bar}
        <div class="bar-container">
          <div 
            class="bar" 
            style:height="{(bar.value / maxValue * 100)}%"
            style:background-color={color || '#0082ff'}
          ></div>
          <span class="label">{bar.month}</span>
        </div>
      {/each}
    </div>
  </div>
  
  <style>
    .card-preview {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }
  
    .card-header {
      margin-bottom: 1rem;
    }
  
    .card-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
  
    .chart {
      height: 150px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: 1rem 0;
      gap: 8px;
    }
  
    .bar-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
  
    .bar {
      width: 100%;
      border-radius: 4px 4px 0 0;
      transition: height 0.3s ease;
    }
  
    .label {
      font-size: 0.75rem;
      margin-top: 0.5rem;
      color: #666;
    }
  </style>