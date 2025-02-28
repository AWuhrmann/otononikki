<script lang="ts">
  import * as d3 from "d3";

  /** @type {{ 
      values: Array<{ value: number, timestamp: string }>,
      color?: string,
    }} */
  let {
    values = [],
    color = "#4f46e5", // Default indigo color
  } = $props();

  let svgElement: SVGSVGElement;
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  type DataPoint = {
    value: number;
    timestamp: string;
  };

  function processHourlyData(data: DataPoint[]) {
    if (!data || data.length === 0) return [];

    // Initialize an array for all 24 hours with 0 values
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      value: 0,
      count: 0,
    }));

    // Sum values for each hour
    data.forEach((item) => {
      const date = new Date(item.timestamp);
      const hour = date.getHours();

      const value =
        typeof item.value === "string" ? parseFloat(item.value) : item.value;

      if (!isNaN(value)) {
        hourlyData[hour].value += value;
        hourlyData[hour].count += 1;
      }
    });

    // Calculate average per hour (if there were multiple entries)
    return hourlyData.map((item) => ({
      hour: item.hour,
      value: item.count > 0 ? item.value / item.count : 0,
      // Format to display like "12 AM", "1 PM", etc.
      label: formatHourLabel(item.hour),
    }));
  }

  function formatHourLabel(hour: number): string {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  }

  $effect(() => {
    if (!svgElement || !containerWidth || !containerHeight) return;

    // Clear existing chart
    d3.select(svgElement).selectAll("*").remove();

    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3
      .select(svgElement)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data for hourly display
    const hourlyData = processHourlyData(values);
    if (hourlyData.length === 0) return;

    // X scale for hours
    const xScale = d3
      .scaleBand()
      .domain(hourlyData.map((d) => d.hour.toString()))
      .range([0, width])
      .padding(0.2);

    // Y scale for values
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(hourlyData, (d) => d.value) || 0])
      .nice()
      .range([height, 0]);

    // Create bars
    svg
      .selectAll(".bar")
      .data(hourlyData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.hour.toString()) || 0)
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.value))
      .attr("fill", color)
      .attr("rx", 4)
      .attr("ry", 4)
      .append("title")
      .text((d) => `${d.label}: ${d.value.toFixed(2)}`);

    // X-axis
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(xScale.domain().filter((_, i) => i % 3 === 0)) // Show every 3rd hour
          .tickFormat((hour) => {
            const hourNum = parseInt(hour);
            // Show as 12AM, 3AM, 6AM, etc.
            if (hourNum === 0) return "12AM";
            if (hourNum === 12) return "12PM";
            return hourNum < 12 ? `${hourNum}AM` : `${hourNum - 12}PM`;
          }),
      );

    // Y-axis
    const yAxis = svg.append("g").call(d3.axisLeft(yScale));

    // Add a title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Average Value by Hour of Day");

    // X-axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Hour of Day");

    // Y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Average Value");
  });
</script>

<style>
  .chart-container {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .chart-container svg {
    width: 100%;
    height: 100%;
  }
</style>

<div
  class="chart-container"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
  <svg bind:this={svgElement}></svg>
</div>
