<script lang="ts">
  import { CardState, saveCard, updateCardProps } from "$lib/card.svelte";
  import { Plus, Minus, CalendarCheck } from "lucide-svelte";
  import _ from "lodash";
  import CardOptions from "$components/CardOptions.svelte";
  import ActivityGrid from "$components/ActivityGrid.svelte";

  // I will try to implement floating UIs type shit :))

  let { card } = $props();

  let card_: CardState = $state(structuredClone(card));

  let value: number = $state(getValue());

  function getValue() {
    // Return the current value of the card. If the user has not entered a value for the local day yet, it tries to get the default value of the settings or the minimum, if none are found return 0.
    if (card.values.length == 0) return 0;
    const cardDate = card.values[card.values.length - 1].timestamp;
    const today = new Date();
    const lastDay = new Date(cardDate);
    if (today.getDate() != lastDay.getDate()) {
      if (!("default" in card_.settings)) {
        if ("Minimum" in card_.settings) {
          return parseFloat(card_.settings["Minimum"]);
        }
        return 0;
      }
      return parseFloat(card_.settings["default"]);
    }
    return parseFloat(card.values[card.values.length - 1].value);
  }

  function increment() {
    if ("Maximum" in card.settings && value >= card.settings.Maximum) {
      return;
    }
    value += 1;
    saveCard(card, value);
  }

  function decrement() {
    if ("Minimum" in card.settings && value <= card.settings.Minimum) {
      return;
    }
    value -= 1;
    saveCard(card, value);
  }

  function createSafeId(id: string) {
    // Replace any non-alphanumeric character with a dash and convert to lowercase
    return "chart-" + id;
  }

  let colorClassMaximum = $derived(
    "Maximum" in card.settings && value >= card.settings.Maximum
      ? "text-gray-500 cursor-default"
      : "text-black hover:opacity-80 transition-colors cursor-pointer",
  );
  let colorClassMinimum = $derived(
    "Minimum" in card.settings && value <= card.settings.Minimum
      ? "text-gray-500 cursor-default"
      : "text-black hover:opacity-80 transition-colors cursor-pointer",
  );

  $effect(() => {
    // This part checks if some of the settings have been modified, and update them on the database.

    Object.keys(card_.settings).forEach((key) => {
      const old = card.settings[key];
      const new_ = card_.settings[key];

      if (old !== new_) {
        // Making sure we only new values
        console.log(`Different value for setting ${key}`);
        updateCardProps(card_.id, card_.userId, key, new_);
        card.settings[key] = new_; // We also need to update the card...
      }
    });

    if (card.name !== card_.name) {
      updateCardProps(card_.id, card_.userId, "name", card_.name);
    }
  });

  function validateCard() {
    card_.settings["validated_at"] = new Date().getTime();

    // hides the card until next day
  }
</script>

<style>
  /* For some reason this style block cannot be removed... */
</style>

<div
  class="flex items-center justify-between bg-white rounded-lg py-2 w-[500px] min-h-[150px] box-shadow shadow-md"
>
  <div
    class="flex flex-col justify-start gap-[20px] pl-4 font-['Inter'] h-full w-[200px]"
  >
    <div>
      <p class="font-bold text-xl">{card_.name}</p>
      <button class="text-gray-400" onclick={() => console.log(card.settings)}
        >{card_.name}</button
      >
    </div>
    <p class="text-4xl">
      {value}
      {#if "unit" in card.settings}
        <span class="text-lg text-gray-400">{card.settings.unit}</span>
      {/if}
    </p>
  </div>
  <div class="w-[200px]" id={createSafeId(card.id)}>
    <ActivityGrid
      values={card.values}
      monthYear={new Date().toISOString().slice(0, 7)}
      lastValue={value}
      color={card.settings.color || "#000000"}
      n={10}
    />
  </div>
  <div class="flex flex-col items-center pr-2 h-full">
    <CardOptions bind:card={card_} />
    <div class="flex-grow flex flex-col justify-center gap-0">
      <button
        class="bg-white border-0 shadow-none"
        disabled={"Maximum" in card_.settings && value > card_.settings.Maximum}
        onclick={increment}><Plus class={colorClassMaximum} /></button
      >
      <button
        class="bg-white border-0 shadow-none"
        disabled={"Minimum" in card_.settings && value < card_.settings.Minimum}
        onclick={decrement}><Minus class={colorClassMinimum} /></button
      >
    </div>
    <button class="bg-white border-0 shadow-none" onclick={validateCard}
      ><CalendarCheck /></button
    >
  </div>
</div>
