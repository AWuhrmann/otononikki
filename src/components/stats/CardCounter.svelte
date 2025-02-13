<script lang="ts">
  let { name, picture } = $props();
</script>

<style>
  .card {
    --background: white;
    --background: #fff;
    --background-checkbox: #0082ff;
    --background-image: rgba(189, 189, 189, 0.2);
    --text-color: #666;
    --text-headline: #000;
    --card-shadow: #0082ff;
    --card-height: 150px;
    /* --card-max-height: 400px; */
    --card-width: 100%;
    --card-radius: 12px;
    --header-height: 47px;
    --blend-mode: overlay;
    --transition: 0.15s;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    display: flex;
    flex-direction: column;
    font-family: "Arial", Inter;
    align-items: center;
    /* Center content inside the card */
    flex: 1 1 calc(50% - 10px); /* 50% width minus the gap */
    box-sizing: border-box; /* Ensure padding and border are included in the width calculation */
    height: 100%;
  }

  .card:nth-child(odd) .card__body-cover-image {
    --x-y1: 10% 100%;
    --x-y2: 16% 67%;
    --x-y3: 10% 33%;
    --x-y4: 13% 0%;
  }

  .card:nth-child(even) .card__body-cover-image {
    --x-y1: 13% 100%;
    --x-y2: 10% 67%;
    --x-y3: 16% 33%;
    --x-y4: 10% 0%;
  }

  .card__input {
    position: absolute;
    display: block;
    outline: none;
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    -webkit-appearance: none;
    appearance: none;
  }

  .card__input:checked ~ .card__body {
    --shadow: 0 0 0 3px var(--card-shadow);
  }

  .card__input:checked ~ .card__body .card__body-cover-checkbox {
    --check-bg: var(--background-checkbox);
    --check-border: #fff;
    --check-scale: 1;
    --check-opacity: 1;
  }

  .card__input:checked ~ .card__body .card__body-cover-checkbox--svg {
    --stroke-color: #fff;
    --stroke-dashoffset: 0;
  }

  .card__input:checked ~ .card__body .card__body-cover:after {
    --opacity-bg: 0;
  }

  .card__input:checked ~ .card__body .card__body-cover-image {
    --filter-bg: grayscale(0);
  }

  .card__input:checked ~ .card__body .card__body-header-title {
    --filter-bg: grayscale(0);
  }

  .card__input:disabled ~ .card__body {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .card__input:disabled ~ .card__body:active {
    --scale: 1;
  }

  .card__body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    /* Split the card into two columns */
    grid-template-rows: auto;
    /* Allow the rows to size naturally */
    background: var(--background);
    height: var(--card-height);
    max-height: var(--card-max-height);
    width: var(--card-width);
    border-radius: var(--card-radius);
    flex-direction: row;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    box-shadow: var(--shadow, 0 4px 4px 0 rgba(0, 0, 0, 0.02));
    transition:
      transform var(--transition),
      box-shadow var(--transition);
    transform: scale(var(--scale, 1)) translateZ(0);
  }

  .card__body:active {
    --scale: 0.96;
  }

  .card__body-cover {
    --c-border: var(--card-radius) var(--card-radius) 0 0;
    --c-width: 100%;
    --c-height: 150px;
    flex: 0 0 1000px;
    /* Set a fixed width for the image container */
    position: relative;
    overflow: hidden;
  }

  .card__body-cover:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: var(--c-width);
    max-height: var(--c-height);
    border-radius: var(--c-border);
    background: linear-gradient(to bottom right, var(--background-image));
    mix-blend-mode: var(--blend-mode);
    opacity: var(--opacity-bg, 1);
    transition: opacity var(--transition) linear;
  }

  .card__body-cover-image {
    width: var(--c-width);
    height: var(--c-height);
    -o-object-fit: cover;
    object-fit: cover;
    border-radius: var(--c-border);
    filter: var(--filter-bg, grayscale(1));
    -webkit-clip-path: polygon(
      100% 0%,
      100% 100%,
      var(--x-y1, 10% 100%),
      var(--x-y2, 20% 67%),
      var(--x-y3, 15% 33%),
      var(--x-y4, 10% 0%)
    );
    clip-path: polygon(
      100% 0%,
      100% 100%,
      var(--x-y1, 10% 100%),
      var(--x-y2, 20% 67%),
      var(--x-y3, 15% 33%),
      var(--x-y4, 10% 0%)
    );
  }

  .card__body-cover-checkbox {
    background: var(--check-bg, var(--background-checkbox));
    border: 2px solid var(--check-border, #fff);
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 1;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    opacity: var(--check-opacity, 0);
    transition:
      transform var(--transition),
      opacity calc(var(--transition) * 1.2) linear;
    transform: scale(var(--check-scale, 0));
  }

  .card__body-cover-checkbox--svg {
    width: 13px;
    height: 11px;
    display: inline-block;
    vertical-align: top;
    fill: none;
    margin: 7px 0 0 5px;
    stroke: var(--stroke-color, #fff);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 16px;
    stroke-dashoffset: var(--stroke-dashoffset, 16px);
    transition: stroke-dashoffset 0.4s ease var(--transition);
  }

  .card__body-header {
    flex: 1;
    height: var(--header-height);
    background: var(--background);
    padding: 0 10px 10px 10px;
  }

  .card__body-header-title {
    filter: var(--filter-bg, grayscale(1));
    font-size: 35px;
    /* Adjust the font size as needed */
    font-weight: bold;
    margin-top: 8px;
  }

  .card__body-header-subtitle {
    color: var(--text-color);
    font-size: 12px;
    /* Adjust the font size as needed */
    font-weight: bold;
  }

  @media (max-width: 600px) {
    .card__body-header-title {
      font-size: 32px;
      /* Larger font size for smaller screens */
    }
    .card__body-header-subtitle {
      font-size: 20px;
      /* Larger font size for smaller screens */
    }
  }
</style>

<label class="card">
  <input class="card__input" type="checkbox" />
  <div class="card__body">
    <header class="card__body-header">
      <h2 class="card__body-header-title">{name}</h2>
      <p class="card__body-header-subtitle">{name}</p>
    </header>
    <div class="card__body-cover">
      <img
        alt="image of {name}"
        class="card__body-cover-image"
        src={picture}
      /><span class="card__body-cover-checkbox">
        <svg class="card__body-cover-checkbox--svg" viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
        </svg></span
      >
    </div>
  </div>
</label>

