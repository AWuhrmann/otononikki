<script lang="ts">
  import { CounterState } from "$lib/counter.svelte"
  import { CardState, saveCard, updateCardProps } from "$lib/card.svelte"
  import { Plus, Minus, SlidersHorizontal, CalendarCheck } from "lucide-svelte"
  import { onMount } from "svelte"
  import * as d3 from "d3"
  import _ from "lodash"
  import CardSettings2 from "./CardSettings2.svelte"
  import Children from "$components/Children.svelte"
  import SuperParent from "$components/SuperParent.svelte"
    import ActivityGrid from "$components/ActivityGrid.svelte"

  // I will try to implement floating UIs type shit :))

  let { card } = $props()

  let card_: CardState = $state(structuredClone(card))

  let value: number = $state(getValue())

  let name = $state(card.name)

  function getValue() {
    if (card.values.length == 0) return 0
    return parseFloat(card.values[card.values.length - 1].value)
  }

  function getDate() {
    if (card.values.length == 0) return new Date().getTime()
    return card.values[card.values.length - 1].timestamp
  }

  function increment() {
    if ("max_value" in card.settings && value >= card.settings.max_value) {
      return
    }
    value += 1
    saveCard(card, value)
  }

  function decrement() {
    if ("min_value" in card.settings && value <= card.settings.min_value) {
      return
    }
    value -= 1
    saveCard(card, value)
  }

  function createSafeId(id: string) {
    // Replace any non-alphanumeric character with a dash and convert to lowercase
    return "chart-" + id
  }

  let colorClass = $derived(
    "min_value" in card.settings && value <= card.settings.min_value
      ? "text-gray-500 cursor-default"
      : "text-black hover:opacity-80 transition-colors cursor-pointer",
  )

  $effect(() => {
    Object.entries(card_.settings).forEach(([key, value]) => {
      console.log(`${key}: ${value}`)
      updateCardProps(card_.id, card_.userId, key, value);
    })
    updateCardProps(card_.id, card_.userId, 'name', card_.name);
  })

  function validateCard() {

    card_.settings['validated_at'] = new Date().getTime()

    // hides the card until next day
  }
</script>

<div
  class="flex items-center justify-between bg-white rounded-lg py-2 w-[500px] h-[150px] box-shadow shadow-md"
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
      lastValue={getValue()} 
      color={card.settings.color || '#000000'} 
    />
  </div>
  <div class="flex flex-col items-center pr-2 h-full">
    <SuperParent bind:card={card_} />
    <div class="flex-grow flex flex-col justify-center gap-0">
      <button class="bg-white border-0 shadow-none" onclick={increment}
        ><Plus /></button
      >
      <button class="bg-white border-0 shadow-none" onclick={decrement}
        ><Minus class={colorClass} /></button
      >
    </div>
    <button class="bg-white border-0 shadow-none" onclick={validateCard}
      ><CalendarCheck class={colorClass} /></button
    >
  </div>
</div>

<style>
</style>
