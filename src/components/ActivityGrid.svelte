<script lang="ts">
  import * as d3 from "d3";

  /** @type {{ 
      values: Array<{ value: number, timestamp: string }>,
      monthYear: string,
      lastValue?: number,
      color?: string,
      n?: number 
    }} */
  let {
    values = [],
    monthYear,
    lastValue,
    color = "#000000",
    n = 15,
  } = $props();

  let svgElement: SVGSVGElement;
  let isHovered = $state(false);
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  type DataRecords = {
    value: number;
    timestamp: string;
  };

  function processBarChartData(data: DataRecords[], n = 15) {
    if (!data || data.length === 0) return [];

    // Create a map of dates to values
    const valuesByDate = new Map();
    data.forEach((item) => {
      const date = new Date(item.timestamp);
      // Set to start of day for comparison
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split("T")[0];

      // If we have multiple values for same day, take the latest one
      if (
        !valuesByDate.has(dateStr) ||
        new Date(valuesByDate.get(dateStr).timestamp) < new Date(item.timestamp)
      ) {
        valuesByDate.set(dateStr, item);
      }
    });

    // Generate array of last n days
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(today);
      if (i === 0 && lastValue !== undefined) {
        result.push({
          timestamp: date,
          value: lastValue,
        });
        continue;
      }
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      result.push({
        timestamp: date,
        value: valuesByDate.has(dateStr)
          ? typeof valuesByDate.get(dateStr).value === "string"
            ? parseFloat(valuesByDate.get(dateStr).value)
            : valuesByDate.get(dateStr).value
          : 0,
      });
    }

    console.log(result);

    return result;
  }

  function processGridData(data: DataRecords[], monthYear: string) {
    if (!data || data.length === 0 || !monthYear) return [];

    const [year, month] = monthYear.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Create a map of day -> value for the data
    const valuesByDay = new Map();
    data.forEach((item) => {
      const date = new Date(item.timestamp);
      const day = date.getDate();
      const itemMonth = date.getMonth() + 1;
      const itemYear = date.getFullYear();

      if (
        itemMonth === month &&
        itemYear === year &&
        (!valuesByDay.has(day) ||
          new Date(valuesByDay.get(day).timestamp) < date)
      ) {
        valuesByDay.set(day, item);
      }
    });

    // Create full month data array
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayData = valuesByDay.get(day);
      return {
        date: new Date(year, month - 1, day),
        value: dayData ? dayData.value : 0,
      };
    });
  }

  $effect(() => {
    if (!svgElement || !containerWidth || !containerHeight) return;

    // Clear existing chart
    d3.select(svgElement).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3
      .select(svgElement)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    if (!isHovered) {
      // Bar Chart View
      const barData = processBarChartData(values, n);
      if (barData.length === 0) return;

      const xScale = d3
        .scaleBand()
        .domain(barData.map((_, i) => i.toString()))
        .range([0, width])
        .padding(0.2);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(barData, (d) => d.value) || 0])
        .range([height, 0]);

      const bars = svg
        .selectAll("rect")
        .data(barData)
        .join("rect")
        .attr("x", (_, i) => xScale(i.toString()) ?? 0)
        .attr("y", (d) => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => height - yScale(d.value))
        .attr("fill", color)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", "black");

      bars
        .append("title")
        .text((d) => `${d.timestamp.toLocaleDateString()}\nValue: ${d.value}`);
    } else {
      // Grid View
      const gridData = processGridData(values, monthYear);
      if (gridData.length === 0) return;

      const totalDays = 7;
      const totalWeeks = Math.ceil(
        (gridData.length + new Date(gridData[0].date).getDay()) / 7,
      );

      const cellSize = Math.min(
        (width - (totalDays - 1) * 2) / totalDays,
        (height - (totalWeeks - 1) * 2) / totalWeeks,
      );
      const cellPadding = Math.max(2, cellSize * 0.1);

      // Color scale for grid
      const maxValue = d3.max(gridData, (d) => d.value) || 0;
      const colorScale = d3
        .scaleSequential()
        .domain([0, maxValue])
        .interpolator(d3.interpolateRgb("#ffffff", color));

      // Create grid visualization
      const cells = svg
        .selectAll("rect")
        .data(gridData)
        .join("rect")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", (d) => {
          const dayOfWeek = d.date.getDay();
          return dayOfWeek * (cellSize + cellPadding);
        })
        .attr("y", (d) => {
          const firstDayOfMonth = new Date(
            d.date.getFullYear(),
            d.date.getMonth(),
            1,
          ).getDay();
          const adjustedDay = d.date.getDate() - 1 + firstDayOfMonth;
          const week = Math.floor(adjustedDay / 7);
          return week * (cellSize + cellPadding);
        })
        .attr("fill", (d) => colorScale(d.value))
        .attr("rx", 2)
        .attr("ry", 2);

      cells
        .append("title")
        .text((d) => `${d.date.toLocaleDateString()}\nValue: ${d.value}`);

      // Add weekday labels
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      svg
        .selectAll(".weekday-label")
        .data(weekdays)
        .join("text")
        .attr("class", "weekday-label")
        .attr("x", (_, i) => i * (cellSize + cellPadding) + cellSize / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", `${cellSize * 0.4}px`)
        .attr("fill", color)
        .text((d) => d[0]);
    }
  });
</script>

<style>
  .activity-grid {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .activity-grid svg {
    width: 100%;
    height: 100%;
  }
</style>

<div
  class="activity-grid"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
  tabindex="0"
  role="switch"
  aria-checked={isHovered}
>
  <svg bind:this={svgElement}></svg>
</div>
