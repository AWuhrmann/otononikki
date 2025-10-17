<script lang="ts">
    import { Time } from "@internationalized/date";
  import { Label, Switch, TimeRangeField, type TimeRange } from "bits-ui";
  import { DatePicker } from "bits-ui";
  import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
  import CaretLeft from "phosphor-svelte/lib/CaretLeft";
  import CaretRight from "phosphor-svelte/lib/CaretRight";
  let { onCheckFullDay }: { onCheckFullDay: (check: boolean) => void } = $props();
  let checked = $state<boolean>(true);
  const hourCycle: "24" = "24";

  let myValue = $state<TimeRange>({
    start: new Time(12, 30),
    end: new Time(14, 30),
  });

  $effect(() => {onCheckFullDay(checked)});
</script>

<div class="">
  <div class="flex items-center space-x-3">
    <Switch.Root
      bind:checked={checked}
      id="dnd"
      name="hello"
      class="focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-foreground data-[state=unchecked]:bg-dark-10 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-foreground focus-visible:outline-hidden peer inline-flex h-[36px] min-h-[36px] w-[60px] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Switch.Thumb
        class="bg-background data-[state=unchecked]:shadow-mini dark:border-background/30 dark:bg-foreground dark:shadow-popover pointer-events-none block size-[30px] shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:border dark:data-[state=unchecked]:border"
      />
    </Switch.Root>
    <Label.Root for="dnd" class="text-sm font-medium">Full day</Label.Root>
  </div>
  <div>
    <DatePicker.Root weekdayFormat="short" fixedWeeks={true}>
      <div class="flex w-full max-w-[232px] flex-col gap-1.5 mt-4">
        <DatePicker.Input
          class="h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover flex w-full max-w-[232px] select-none items-center border px-2 py-3 text-sm tracking-[0.01em]"
        >
          {#snippet children({ segments })}
            {#each segments as { part, value }, i (part + i)}
              <div class="inline-block select-none">
                {#if part === "literal"}
                  <DatePicker.Segment
                    {part}
                    class="text-muted-foreground p-1/3"
                  >
                    {value}
                  </DatePicker.Segment>
                {:else}
                  <DatePicker.Segment
                    {part}
                    class="rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1"
                  >
                    {value}
                  </DatePicker.Segment>
                {/if}
              </div>
            {/each}
            <DatePicker.Trigger
              class="text-foreground/60 hover:bg-muted active:bg-dark-10 ml-auto inline-flex size-8 items-center justify-center rounded-[5px] transition-all"
            >
              <CalendarBlank class="size-6" />
            </DatePicker.Trigger>
          {/snippet}
        </DatePicker.Input>
        <DatePicker.Content sideOffset={6} class="z-50">
          <DatePicker.Calendar
            class="border-dark-10 bg-background-alt shadow-popover rounded-[15px] border p-[22px]"
          >
            {#snippet children({ months, weekdays })}
              <DatePicker.Header class="flex items-center justify-between">
                <DatePicker.PrevButton
                  class="rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]"
                >
                  <CaretLeft class="size-6" />
                </DatePicker.PrevButton>
                <DatePicker.Heading class="text-[15px] font-medium" />
                <DatePicker.NextButton
                  class="rounded-9px bg-background-alt hover:bg-muted inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]"
                >
                  <CaretRight class="size-6" />
                </DatePicker.NextButton>
              </DatePicker.Header>
              <div
                class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
              >
                {#each months as month (month.value)}
                  <DatePicker.Grid
                    class="w-full border-collapse select-none space-y-1"
                  >
                    <DatePicker.GridHead>
                      <DatePicker.GridRow
                        class="mb-1 flex w-full justify-between"
                      >
                        {#each weekdays as day (day)}
                          <DatePicker.HeadCell
                            class="text-muted-foreground font-normal! w-10 rounded-md text-xs"
                          >
                            <div>{day.slice(0, 2)}</div>
                          </DatePicker.HeadCell>
                        {/each}
                      </DatePicker.GridRow>
                    </DatePicker.GridHead>
                    <DatePicker.GridBody>
                      {#each month.weeks as weekDates (weekDates)}
                        <DatePicker.GridRow class="flex w-full">
                          {#each weekDates as date (date)}
                            <DatePicker.Cell
                              {date}
                              month={month.value}
                              class="p-0! relative size-10 text-center text-sm"
                            >
                              <DatePicker.Day
                                class="rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal transition-all"
                              >
                                <div
                                  class="bg-foreground group-data-selected:bg-background group-data-today:block absolute top-[5px] hidden size-1 rounded-full transition-all"
                                ></div>
                                {date.day}
                              </DatePicker.Day>
                            </DatePicker.Cell>
                          {/each}
                        </DatePicker.GridRow>
                      {/each}
                    </DatePicker.GridBody>
                  </DatePicker.Grid>
                {/each}
              </div>
            {/snippet}
          </DatePicker.Calendar>
        </DatePicker.Content>
      </div>
    </DatePicker.Root>
    {#if !checked}
      <TimeRangeField.Root
        hourCycle={24 as const}
        bind:value={myValue}
        validate={(timeRange) => {
          if (timeRange.start && timeRange.end) {
            if (timeRange.end.compare(timeRange.start) <= 0) {
              return "End time must be after start time";
            }
          }
        }}
        class="group flex w-full max-w-[320px] flex-col gap-1.5"
      >
        <TimeRangeField.Label
          class="block select-none text-sm font-medium"
        ></TimeRangeField.Label>
        <div
          class="h-input rounded-input border-border-input bg-background text-foreground focus-within:border-border-input-hover focus-within:shadow-date-field-focus hover:border-border-input-hover group-data-invalid:border-destructive flex w-full select-none items-center border px-2 py-3 text-xs tracking-[0.01em]"
        >
          {#each ["start", "end"] as const as type (type)}
            <TimeRangeField.Input {type}>
              {#snippet children({ segments })}
                {#each segments as { part, value }, i (part + i)}
                  <div class="inline-block select-none">
                    {#if part === "literal"}
                      <TimeRangeField.Segment
                        {part}
                        class="text-muted-foreground p-1"
                      >
                        {value}
                      </TimeRangeField.Segment>
                    {:else}
                      <TimeRangeField.Segment
                        {part}
                        class="rounded-5px hover:bg-muted focus:bg-muted focus:text-foreground aria-[valuetext=Empty]:text-muted-foreground focus-visible:ring-0! focus-visible:ring-offset-0! px-1 py-1"
                      >
                        {value}
                      </TimeRangeField.Segment>
                    {/if}
                  </div>
                {/each}
              {/snippet}
            </TimeRangeField.Input>
            {#if type === "start"}
              <div aria-hidden="true" class="text-muted-foreground pl-1 pr-2">
                to
              </div>
            {/if}
          {/each}
        </div>
      </TimeRangeField.Root>
    {/if}
  </div>
</div>
