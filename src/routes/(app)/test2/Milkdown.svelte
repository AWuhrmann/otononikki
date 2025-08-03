<script lang="ts">
  import { onMount, tick } from "svelte";
  import { Crepe } from "@milkdown/crepe";
  import { TooltipProvider } from "@milkdown/plugin-tooltip";
  import { tooltipFactory } from "@milkdown/plugin-tooltip";
  import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
  import { commandsCtx } from "@milkdown/kit/core";
  import { replaceAll } from "@milkdown/utils";
  import { toggleLinkCommand } from "@milkdown/kit/preset/commonmark";
  import type { EditorView, EditorState } from "@milkdown/prose/view";
  import {
    Bold,
    Italic,
    Strikethrough,
    CircleHelp,
    MessageSquareText,
  } from "lucide-svelte/icons";

  let ttDiv: HTMLDivElement | null = $state(null);
  let provider: TooltipProvider | undefined;
  let ttVisible = $state(true);
  let ttImprove = $state(true);
  let crepe: Crepe | undefined;
  let editorView: EditorView | undefined;
  let lastSetValue = "";
  let focused = false;

  const tooltip = tooltipFactory("assistant-tooltip");

  // Dummy content to load in the editor
  const defaultContent = `# Hello Milkdown\nTry the tooltip buttons!`;

  function hide() {
    ttVisible = false;
    ttImprove = false;
  }

  function onBold() {
    provider && editorView && editorView.dispatch(editorView.state.tr); // Dummy - no commandsCtx here, just stub
  }

  function onItalic() {
    provider && editorView && editorView.dispatch(editorView.state.tr);
  }

  function onStrikethrough() {
    provider && editorView && editorView.dispatch(editorView.state.tr);
  }

  async function onExplain() {
    alert("Explain clicked!");
  }

  async function onImproveClick() {
    ttImprove = true;
    await tick();
  }

  function ttUpdate(updatedView: EditorView, prevState: EditorState) {
    editorView = updatedView;
    provider?.update(updatedView, prevState);
  }

  function ttDestroy() {
    provider?.destroy();
    ttVisible = false;
    ttImprove = false;
  }

  function editor(node: HTMLElement) {
    crepe = new Crepe({
      root: node,
      defaultValue: defaultContent,
      features: {
        [Crepe.Feature.Toolbar]: false,
      },
    });

    crepe.editor
      .config((ctx) => {
        const listenerInstance = ctx.get(listenerCtx);
        listenerInstance.markdownUpdated((_ctx, markdown, prevMarkdown) => {
          if (markdown === prevMarkdown || markdown === lastSetValue) return;
          lastSetValue = markdown;
        });

        ctx.set(tooltip.key, {
          view: () => ({
            update: ttUpdate,
            destroy: ttDestroy,
          }),
        });
      })
      .use(listener)
      .use(tooltip);

    crepe.create();

    console.log("crepe created");

    return {
      destroy() {
        crepe?.destroy();
        crepe = undefined;
        ttDiv = null;
      },
    };
  }

  $effect(() => {
    if (ttDiv && !provider) {
      console.log("on veut init");
      provider = new TooltipProvider({
        content: ttDiv!,
      });
      provider.onShow = () => {
        console.log("devbriat etre visble");
        ttVisible = true;
      };
      provider.onHide = hide;
    }
  });
</script>

<style>
  .icon {
    width: 20px;
    height: 20px;
  }
  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2rem;
  }
  button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>

<div
  use:editor
  onfocusin={() => (focused = true)}
  onfocusout={() => (focused = false)}
  style="min-height: 200px; border: 1px solid #ccc; padding: 1rem;"
></div>

{#if ttVisible}
  <div
    class="tooltip-container"
    bind:this={ttDiv}
    style="position: absolute; background: white; border-radius: 1rem; box-shadow: 0 0 10px rgba(0,0,0,0.15); padding: 0.5rem; display: flex; gap: 0.5rem; z-index: 100;"
  >
    <button onclick={onBold} disabled={ttImprove} title="Bold">
      <Bold class="icon" />
    </button>
    <button onclick={onItalic} disabled={ttImprove} title="Italic">
      <Italic class="icon" />
    </button>
    <button
      onclick={onStrikethrough}
      disabled={ttImprove}
      title="Strikethrough"
    >
      <Strikethrough class="icon" />
    </button>
    <button onclick={onExplain} disabled={ttImprove} title="Explain">
      <CircleHelp class="icon" />
    </button>
    <button onclick={onImproveClick} title="Improve">
      <MessageSquareText class="icon" />
    </button>
    {#if ttImprove}
      <div>
        <input
          placeholder="Instructions..."
          style="padding: 0.5rem; width: 200px;"
        />
      </div>
    {/if}
  </div>
{/if}
