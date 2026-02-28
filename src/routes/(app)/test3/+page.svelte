<script lang="ts">
  import { Menubar } from "bits-ui";
  import CaretRight from "phosphor-svelte/lib/CaretRight";
  import Cat from "phosphor-svelte/lib/Cat";
  import Check from "phosphor-svelte/lib/Check";
 
  let selectedView = $state("table");
  let selectedProfile = $state("pavel");
 
  let grids = $state([
    {
      checked: true,
      label: "Pixel"
    },
    {
      checked: false,
      label: "Layout"
    }
  ]);
 
  let showConfigs = $state([
    {
      checked: true,
      label: "Show Bookmarks"
    },
    {
      checked: false,
      label: "Show Full URLs"
    }
  ]);
 
  const profiles = [
    {
      value: "hunter",
      label: "Hunter"
    },
    {
      value: "pavel",
      label: "Pavel"
    },
    {
      value: "adrian",
      label: "Adrian"
    }
  ];
 
  const views = [
    {
      value: "table",
      label: "Table"
    },
    {
      value: "board",
      label: "Board"
    },
    {
      value: "gallery",
      label: "Gallery"
    }
  ];
</script>
 
<Menubar.Root
  class="rounded-10px border-dark-10 bg-background-alt shadow-mini flex h-12 items-center gap-1 border px-[3px]"
>
  <Menubar.Menu>
    <Menubar.Trigger
      class="data-highlighted:bg-muted data-[state=open]:bg-muted mr-[20px] inline-flex h-10 cursor-default items-center justify-center rounded-[9px] px-3 text-sm font-medium focus-visible:outline-none"
    >
      Profiles
    </Menubar.Trigger>
    <Menubar.Portal>
      <Menubar.Content
        class="focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden z-50 w-full max-w-[220px] rounded-xl border px-1 py-1.5"
        align="start"
        sideOffset={3}
      >
        <Menubar.RadioGroup bind:value={selectedProfile}>
          {#each profiles as profile, i (profile.label + i)}
            <Menubar.RadioItem
              class="rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none"
              value={profile.value}
            >
              {#snippet children({ checked })}
                {profile.label}
                <div class="ml-auto flex items-center">
                  {#if checked}
                    <Check class="size-5" />
                  {/if}
                </div>
              {/snippet}
            </Menubar.RadioItem>
          {/each}
        </Menubar.RadioGroup>
        <Menubar.Separator />
        <Menubar.Item
          class="rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none"
          >Edit...</Menubar.Item
        >
        <Menubar.Separator />
        <Menubar.Item
          class="rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none"
          >Add Profile...</Menubar.Item
        >
      </Menubar.Content>
    </Menubar.Portal>
  </Menubar.Menu>
</Menubar.Root>
 
{#snippet SwitchOn()}
  <div
    class="bg-dark-10 peer inline-flex h-[15.6px] min-h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[1.5px]"
  >
    <span
      class="bg-background dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-[10px] rounded-full"
    ></span>
  </div>
{/snippet}
 
{#snippet SwitchOff()}
  <div
    class="bg-dark-10 shadow-mini-inset peer inline-flex h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[3px] transition-colors"
  >
    <span
      class="bg-background shadow-mini dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-0 rounded-full transition-transform dark:border"
    ></span>
  </div>
{/snippet}