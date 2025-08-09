<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  
  let scrollY = 0;
  let innerHeight = 0;
  
  onMount(() => {
    const unsubscribe = () => {};
    return unsubscribe;
  });
</script>

<svelte:window bind:scrollY bind:innerHeight />

<div class="page">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1 class="title font-bold">otononikki</h1>
      <p class="subtitle">Life tracker. Customizable. For nerds.</p>
      <div class="scroll-indicator" class:visible={scrollY < 100}>
        <span>Scroll to explore</span>
        <div class="arrow">↓</div>
      </div>
    </div>
  </section>

  <!-- Content Section -->
  <section class="content">
    <div class="container">
      <h2>Latest Updates</h2>

      <div class="update-card">
        <div class="update-date">7 August 2025</div>
        <h3>Notes, Markdown</h3>
        <p> Ability to rename files, create new one with automatic path finding and creation, </p>
        <h3>Learning part</h3>
        <p> Started thinking about best way to learn using active recall and spaced repetition. Leverage AI in a smart way for this.</p>
        <ul>
          <li>LLM generates text with error and you have to detect it</li>
          <li>Basic flashcards</li>
          <li>Flashcards~ish but we have to write the actual answer.</li>
          <li>Maybe sort of a tech diagram where we can unlock some features like in a video game.</li>
          <li>Or a knowledge graph ish. </li>
          <li> Need to research about: 
            <a href="https://www.researchgate.net/publication/360870626_The_knowledge_graph_as_a_learning_tool" target="_blank">Knowledge Graph as a Learning Tool</a>
          </li>
        </ul>
      
      </div>
      
      <div class="update-card">
        <div class="update-date">August 2025</div>
        <h3>Notes, Markdown</h3>
        <p>Added markdown support and file system. Drag and drop functionalities (still WIP for moving files) over markdown. Tested AI implementation for automatic analysis of the note content</p>
      </div>
    </div>
  </section>
</div>

<style>
  .page {
    background: white;
    min-height: 100vh;
  }

  .hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  }

  .hero-content {
    text-align: center;
    max-width: 600px;
    padding: 0 2rem;
  }

  .title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 500;
    color: #2c2c2c;
    margin: 0 0 1rem 0;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .subtitle {
    font-size: clamp(1.1rem, 3vw, 1.4rem);
    color: #666;
    margin: 0 0 3rem 0;
    font-weight: 400;
    letter-spacing: 0.01em;
  }

  .scroll-indicator {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: #999;
    font-size: 0.9rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .scroll-indicator.visible {
    opacity: 1;
  }

  .arrow {
    margin-top: 0.5rem;
    font-size: 1.2rem;
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
    60% {
      transform: translateY(-4px);
    }
  }

  .content {
    padding: 5rem 0 8rem 0;
    background: white;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .content h2 {
    font-size: 2.5rem;
    font-weight: 300;
    color: #2c2c2c;
    text-align: center;
    margin: 0 0 4rem 0;
    letter-spacing: -0.01em;
  }

  .update-card {
    margin-bottom: 3rem;
    padding: 2rem 0;
    border-bottom: 1px solid #eee;
    transition: transform 0.2s ease;
  }

  .update-card:hover {
    transform: translateY(-2px);
  }

  .update-card:last-child {
    border-bottom: none;
  }

  .update-date {
    font-size: 0.85rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .update-card h3 {
    font-size: 1.5rem;
    font-weight: 400;
    color: #2c2c2c;
    margin: 0 0 1rem 0;
    letter-spacing: -0.01em;
  }

  .update-card p {
    font-size: 1rem;
    line-height: 1.6;
    color: #555;
    margin: 0;
    max-width: 600px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .hero {
      padding: 2rem 0;
    }
    
    .content {
      padding: 3rem 0 5rem 0;
    }
    
    .container {
      padding: 0 1.5rem;
    }
    
    .update-card {
      padding: 1.5rem 0;
      margin-bottom: 2rem;
    }
    
    .content h2 {
      font-size: 2rem;
      margin-bottom: 2.5rem;
    }
  }

  /* Smooth scrolling */
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Remove default margins */
  :global(body) {
    margin: 0;
    background: white;
  }
</style>