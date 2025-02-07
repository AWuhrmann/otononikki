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
    updateChart()
    saveCard(card, value)
  }

  function decrement() {
    if ("min_value" in card.settings && value <= card.settings.min_value) {
      return
    }
    value -= 1
    updateChart()
    saveCard(card, value)
  }

  let colorClass = $derived(
    "min_value" in card.settings && value <= card.settings.min_value
      ? "text-gray-500 cursor-default"
      : "text-black hover:opacity-80 transition-colors cursor-pointer",
  )

  $effect(() => {
    updateChart()
  })

  function parseData(data, lastValue, n = 15) {
    // First create the date map as before
    const dateMap = {}

    // Process input data
    for (const item of data) {
      const value =
        typeof item.value === "string" ? parseFloat(item.value) : item.value
      const date = new Date(item.timestamp).toISOString().split("T")[0] // YYYY-MM-DD
      if (!dateMap[date] || item.timestamp > dateMap[date].timestamp) {
        dateMap[date] = {
          date,
          value,
          timestamp: item.timestamp,
        }
      }
    }

    // Find the date range
    const dates = Object.keys(dateMap)
    let startDate =
      dates.length > 0
        ? new Date(Math.min(...dates.map((d) => new Date(d))))
        : new Date() // If no dates, use today
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of day

    // Fill in missing dates with zeros up to today
    const allDates = []
    const currentDate = new Date(startDate)

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0]
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = {
          date: dateStr,
          value: 0,
          timestamp: currentDate.getTime(),
        }
      }
      allDates.push(dateStr)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Sort dates and create final array
    const sortedData = allDates.map((date) => dateMap[date])

    // Check if we need to modify the last value
    if (sortedData.length > 0 && lastValue !== undefined) {
      const lastEntry = sortedData[sortedData.length - 1]
      if (lastEntry.value !== lastValue) {
        lastEntry.value = lastValue
      }
    }

    // Only keep the last n values
    if (sortedData.length > n) {
      sortedData.splice(0, sortedData.length - n)
    }

    return sortedData
  }

  function createSafeId(id: string) {
    // Replace any non-alphanumeric character with a dash and convert to lowercase
    return "chart-" + id
  }

  function updateChart() {
    // Get the last 10 values with their dates
    const lastValue = value
    const chartData = parseData(card.values, lastValue)
    const chartId = createSafeId(card.id)

    // Clear existing chart
    d3.select("#" + chartId)
      .selectAll("*")
      .remove()

    const margin = { top: 10, right: 10, bottom: 10, left: 10 }
    const width = 200 - margin.left - margin.right
    const height = 100 - margin.top - margin.bottom

    // Create tooltip div
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "5px")
      .style("pointer-events", "none")

    const svg = d3
      .select("#" + chartId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(d3.range(chartData.length))
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(chartData, (d) => d.value) || 0])

    svg
      .selectAll("rect")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => x(i) ?? 0)
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", card_.settings["color"])
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9)
        tooltip
          .html(d.date)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(500).style("opacity", 0)
      })
  }

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
      {#if "unit" in card.settings}{card.settings.unit}{/if}
    </p>
  </div>
  <div class="w-[200px]" id={createSafeId(card.id)}></div>
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
