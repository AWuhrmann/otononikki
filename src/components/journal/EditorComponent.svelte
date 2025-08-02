<script lang="ts">
  import { Crepe } from "@milkdown/crepe";
  import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
  import "@milkdown/crepe/theme/common/style.css";
  import "@milkdown/crepe/theme/frame.css";
  import { parserCtx, editorViewCtx } from "@milkdown/kit/core";

  import { replaceAll } from "@milkdown/kit/utils";

  import { createEditorPlugins } from "$lib/editor/plugins/index.js";

  import {
    insertMarkdownAtCursor,
    appendMarkdown,
    createSmartLink,
  } from "$lib/editor/commands/index.js";

  import type {
    EditorConfig,
    EditorPluginConfig,
    EditorActionHandlers,
    EditorInstance,
    EditorChangeEvent,
    LinkClickEvent,
    SmartLinkType,
  } from "$lib/types/editor.js";
  import type { MilkdownPlugin } from "@milkdown/kit/ctx";
    import type { Parser } from "@milkdown/kit/transformer";
    import type { EditorView } from "@milkdown/kit/prose/view";

  // Props
  let {
    config = {
      defaultValue: "# Welcome\n\nStart writing...",
      placeholder: "Type something...",
      readonly: false,
    },
    pluginConfig = {
      links: {
        enableTooltip: true,
        clickHandlers: {
          onTaskFile: (href) =>
            handleLinkClick({
              href,
              linkType: "task",
              text: "",
              event: new MouseEvent("click"),
            }),
          onTaskMissing: (path) => handleTaskMissing(path),
          onContactFile: (href) =>
            handleLinkClick({
              href,
              linkType: "contact",
              text: "",
              event: new MouseEvent("click"),
            }),
          onContactMissing: (path) => handleContactMissing(path),
          onInternalMissing: (path) => handleInternalMissing(path),
          onExternal: (href) =>
            window.open(href, "_blank", "noopener,noreferrer"),
        },
      },
      marks: {
        enabled: true,
      },
    },
    actionHandlers = {},
    currentMarkdown = $bindable(),
  }: {
    config?: EditorConfig;
    pluginConfig?: EditorPluginConfig;
    actionHandlers: EditorActionHandlers;
    currentMarkdown: string;
  } = $props();

  // State
  let crepe: Crepe | undefined = $state(undefined);
  let editorReady = $state(false);
  //   let currentMarkdown = $state(config.defaultValue || "");

  // Create editor instance
  function createEditor(node: HTMLElement): EditorInstance | undefined {
    try {
      crepe = new Crepe({
        root: node,
        defaultValue: config.defaultValue,
      });

      const plugins = createEditorPlugins(pluginConfig);

      crepe.editor
        .config((ctx) => {
          // Setup change listener
          ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
            // currentMarkdown = markdown;
            const changeEvent: EditorChangeEvent = {
              markdown,
              html: "", // You could get HTML if needed
            };
            actionHandlers.onChange?.(changeEvent);
          });
        })
        .use(listener)
        .use([...(plugins as MilkdownPlugin[])])
        .use(listener)
        .create()
        .then(() => {
          editorReady = true;
          actionHandlers.onReady?.();
        })
        .catch((error) => {
          console.error("Failed to create editor:", error);
        });

      crepe.create();

      return crepe ? { crepe, editor: crepe.editor } : undefined;
    } catch (error) {
      console.error("Error creating editor:", error);
      return undefined;
    }
  }

  $effect(() => {
    if (crepe && currentMarkdown !== undefined) {
      updateEditorContent(currentMarkdown);
    }
  });

  let lastSetValue = '';

  async function updateEditorContent(newMarkdown: string) {
    if (lastSetValue === newMarkdown || !crepe) {
			return;
		}

		crepe.editor.action(replaceAll(newMarkdown));
		lastSetValue = newMarkdown;
  }

  // Event handlers
  function handleLinkClick(event: LinkClickEvent) {
    console.log("Link clicked:", event);
    actionHandlers.onLinkClick?.(event);
  }

  function handleTaskMissing(path: string) {
    if (confirm(`Create new task: ${path}?`)) {
      // You could emit an event or call a handler
      console.log("Creating task:", path);
      // Example: replace the missing link with a real one
      const markdown = `\n[${path.split("/").pop()?.replace(".md", "") || "New Task"}](${path}.md)`;
      insertMarkdownAtCursor(editor, markdown);
    }
  }

  function handleContactMissing(path: string) {
    if (confirm(`Create new contact: ${path}?`)) {
      console.log("Creating contact:", path);
      const markdown = `\n[${path.split("/").pop()?.replace(".md", "") || "New Contact"}](${path}.md)`;
      insertMarkdownAtCursor(editor, markdown);
    }
  }

  function handleInternalMissing(path: string) {
    if (confirm(`Create new page: ${path}?`)) {
      console.log("Creating page:", path);
      const markdown = `\n[${path.split("/").pop()?.replace(".md", "") || "New Page"}](${path}.md)`;
      insertMarkdownAtCursor(editor, markdown);
    }
  }

  // Public methods (can be called from parent component)
  function insertMarkdown(markdown: string) {
    if (crepe) {
      insertMarkdownAtCursor(editor, markdown);
    }
  }

  function appendContent(markdown: string) {
    if (crepe) {
      appendMarkdown(editor, markdown);
    }
  }

  function addSmartLink(
    text: string,
    linkType: SmartLinkType,
    exists: boolean = false,
  ) {
    if (crepe) {
      createSmartLink(text, linkType);
    }
  }

  function getMarkdown(): string {
    return currentMarkdown;
  }

  function setMarkdown(markdown: string) {
    // Implementation would depend on Milkdown's API for setting content
    console.log("Setting markdown:", markdown);
  }

  function getEditorInstance(): EditorInstance | undefined {
    return crepe ? { crepe, editor: crepe.editor } : undefined;
  }

  // Svelte action for editor initialization
  function editor(node: HTMLElement) {
    const instance = createEditor(node);

    return {
      destroy() {
        crepe?.destroy();
        crepe = undefined;
        editorReady = false;
      },
    };
  }

  // Reactive statements
  $effect(() => {
    if (config.readonly && crepe) {
      // Handle readonly mode changes
      // Implementation would depend on Milkdown's API
    }
  });
</script>

<style>
  .editor-container {
    position: relative;
  }

  .editor-container.readonly {
    background-color: #f9fafb;
    cursor: not-allowed;
  }

  .editor-toolbar {
    border: 1px solid #ccc;
    border-bottom: none;
    padding: 0.5rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .editor-statusbar {
    border-top: none;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  :global(.milkdown .ProseMirror) {
    padding: 0rem 10px 0 80px;
  }

  /* Link styles */
  :global(.milkdown a[data-link-type="task"]) {
    color: #8b5cf6 !important;
    background-color: rgba(139, 92, 246, 0.1) !important;
    padding: 1px 3px 1px 18px !important;
    border-radius: 3px !important;
    text-decoration: none !important;
    position: relative !important;
  }

  :global(.milkdown a[data-link-type="task"]:before) {
    content: "📄" !important;
    position: absolute !important;
    left: 2px !important;
    font-size: 12px !important;
  }

  :global(.milkdown a[data-link-type="task-missing"]) {
    color: #8b5cf6 !important;
    background-color: rgba(139, 92, 246, 0.1) !important;
    opacity: 0.6 !important;
    text-decoration: dashed underline !important;
    padding: 1px 3px 1px 18px !important;
    border-radius: 3px !important;
    position: relative !important;
  }

  :global(.milkdown a[data-link-type="task-missing"]:before) {
    content: "❓" !important;
    position: absolute !important;
    left: 2px !important;
    font-size: 12px !important;
  }

  :global(.milkdown a[data-link-type="contact"]) {
    color: #3b82f6 !important;
    background-color: rgba(59, 130, 246, 0.1) !important;
    padding: 1px 3px 1px 18px !important;
    border-radius: 3px !important;
    text-decoration: none !important;
    position: relative !important;
  }

  :global(.milkdown a[data-link-type="contact"]:before) {
    content: "👤" !important;
    position: absolute !important;
    left: 2px !important;
    font-size: 12px !important;
  }

  :global(.milkdown a[data-link-type="contact-missing"]) {
    color: #3b82f6 !important;
    background-color: rgba(59, 130, 246, 0.1) !important;
    opacity: 0.6 !important;
    text-decoration: dashed underline !important;
    padding: 1px 3px 1px 18px !important;
    border-radius: 3px !important;
    position: relative !important;
  }

  :global(.milkdown a[data-link-type="contact-missing"]:before) {
    content: "❓" !important;
    position: absolute !important;
    left: 2px !important;
    font-size: 12px !important;
  }

  :global(.milkdown a[data-link-type="external"]) {
    color: #ef4444 !important;
  }

  :global(.milkdown a[data-link-type="external"]:after) {
    content: " ↗" !important;
    font-size: 0.8em !important;
    opacity: 0.7 !important;
  }

  :global(.milkdown a[data-link-type="arxiv"]) {
    color: #00973f !important;
    background-color: rgba(59, 246, 100, 0.1) !important;
    opacity: 0.6 !important;
    text-decoration: dashed underline !important;
    padding: 1px 3px 1px 18px !important;
    border-radius: 3px !important;
    position: relative !important;
  }

  :global(.milkdown a[data-link-type="arxiv"]:before) {
    content: "📄" !important;
    position: absolute !important;
    left: 2px !important;
    font-size: 12px !important;
  }

  :global(.milkdown a[data-link-type="email"]) {
    color: #10b981 !important;
  }

  :global(.milkdown a[data-link-type="email"]:before) {
    content: "✉️ " !important;
    font-size: 12px !important;
  }
</style>

<!-- Toolbar (optional) -->
{#if $$slots.toolbar}
  <div class="editor-toolbar">
    <slot
      name="toolbar"
      {insertMarkdown}
      {appendContent}
      {addSmartLink}
      {getMarkdown}
    />
  </div>
{/if}

<!-- Editor container -->
<div
  use:editor
  class="editor-container"
  class:readonly={config.readonly}
  style="min-height: 200px"
></div>

<!-- Status bar (optional) -->
{#if $$slots.statusbar}
  <div class="editor-statusbar">
    <slot name="statusbar" {editorReady} {currentMarkdown} />
  </div>
{/if}
