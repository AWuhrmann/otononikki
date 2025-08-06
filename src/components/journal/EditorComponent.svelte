<script lang="ts">
  import { Crepe } from "@milkdown/crepe";
  import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
  import "@milkdown/crepe/theme/common/style.css";
  import "@milkdown/crepe/theme/frame.css";
  import { parserCtx, editorViewCtx } from "@milkdown/kit/core";

  import { $prose as _prose, replaceAll } from "@milkdown/kit/utils";

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
  import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
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
    originalMarkdown = $bindable(),
    // New prop for handling dropped files
    onFileDrop = (
      file: { id: string; name: string; type: string; path: string },
      position?: number,
    ) => {
      // Default implementation - can be overridden by parent
      const extension = file.name.split(".").pop()?.toLowerCase();
      let markdown = "";

      if (file.type === "file") {
        // Check if it's an image
        if (
          ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")
        ) {
          markdown = `![${file.name}](/api/items/${file.id}/content)`;
        } else if (["md", "txt"].includes(extension || "")) {
          // For markdown/text files, you might want to fetch and insert content
          markdown = `[${file.name}](${file.path})`;
        } else {
          // Generic file link
          markdown = `[📎 ${file.name}](/api/items/${file.id})`;
        }
      } else if (file.type === "folder") {
        // For folders, create a link to browse it
        markdown = `[📁 ${file.name}](/browse/${file.id})`;
      } else {
        // Generic link
        markdown = `[${file.name}](${file.id})`;
      }

      console.log("Dropped file markdown:", markdown);

      return markdown;
    },
  }: {
    config?: EditorConfig;
    pluginConfig?: EditorPluginConfig;
    actionHandlers: EditorActionHandlers;
    originalMarkdown?: string;
    onFileDrop?: (
      file: { id: string; name: string; type: string },
      position?: number,
    ) => string;
  } = $props();

  // State
  let crepe: Crepe | undefined = $state(undefined);
  let editorReady = $state(false);
  let isDraggingOver = $state(false);
  let dragCounter = $state(0); // Track drag enter/leave events
  let editorContainer: HTMLElement;
  let dropIndicator: HTMLElement;
  let dropPosition = $state<{ x: number; y: number } | null>(null);

  // Track last dragover time for throttling
  let lastDragLog = 0;

  const diagnosticPlugin = _prose(() => {
    return new Plugin({
      key: new PluginKey("diagnostic"),
      props: {
        handleDOMEvents: {
          drop: (view, event) => {
            console.log("DIAGNOSTIC: Drop captured!", {
              types: Array.from(event.dataTransfer?.types || []),
              files: event.dataTransfer?.files?.length,
              defaultPrevented: event.defaultPrevented,
              target: event.target,
            });
            // Don't handle, just log
            return false;
          },
        },
      },
    });
  });

  // Create a high-priority file drop plugin
  const fileDropPlugin = _prose(() => {
    // Create plugin with explicit key for higher priority
    const pluginKey = new PluginKey("file-drop-handler");

    return new Plugin({
      key: pluginKey,

      // Props with priority flag
      props: {
        handleDOMEvents: {
          // Handle dragenter for visual feedback
          dragenter: (view, event) => {
            console.log(
              "File plugin dragenter, types:",
              event.dataTransfer?.types,
            );

            // Check for our custom file data OR native file drops
            const hasCustomData =
              event.dataTransfer?.types.includes("application/json");
            const hasFiles = event.dataTransfer?.types.includes("Files");

            if (hasCustomData || hasFiles) {
              dragCounter++;
              isDraggingOver = true;
              event.preventDefault();
              // Don't stop propagation - let Crepe know we're dragging
              return false; // Return false to allow other handlers
            }
            return false;
          },

          // Handle dragleave for visual feedback
          dragleave: (view, event) => {
            const hasCustomData =
              event.dataTransfer?.types.includes("application/json");
            const hasFiles = event.dataTransfer?.types.includes("Files");

            if (hasCustomData || hasFiles) {
              dragCounter--;
              if (dragCounter <= 0) {
                dragCounter = 0;
                isDraggingOver = false;
              }
              event.preventDefault();
              return false;
            }
            return false;
          },

          // Handle dragover - MUST preventDefault to allow drop
          dragover: (view, event) => {
            // Throttle logging
            if (Date.now() - lastDragLog > 100) {
              console.log(
                "File plugin dragover, types:",
                event.dataTransfer?.types,
              );
              lastDragLog = Date.now();
            }

            // Check for external files
            const hasCustomData =
              event.dataTransfer?.types.includes("application/json");
            const hasFiles = event.dataTransfer?.types.includes("Files");

            if (hasCustomData || hasFiles) {
              event.preventDefault(); // Critical for allowing drop
              event.dataTransfer!.dropEffect = "copy";

              // Update drop position for visual feedback
              dropPosition = {
                x: event.clientX,
                y: event.clientY,
              };

              // Return false to let other handlers also process if needed
              return false;
            }

            return false;
          },

          // Handle the actual drop - this MUST come before Crepe's handler
          // Replace your drop handler in the fileDropPlugin with this:

          drop: (view, event) => {
            console.log(
              "File plugin DROP event, types:",
              event.dataTransfer?.types,
            );

            // Check if this is an external file drop
            const hasCustomData =
              event.dataTransfer?.types.includes("application/json");
            const hasFiles = event.dataTransfer?.types.includes("Files");

            // If it's internal content (text/html from Crepe), let Crepe handle it
            if (!hasCustomData && !hasFiles) {
              console.log("Not external file, letting Crepe handle it");
              return false;
            }

            // Handle external file drops
            console.log("Handling external file drop!");

            // Reset visual state
            isDraggingOver = false;
            dragCounter = 0;
            dropPosition = null;

            const coords = { left: event.clientX, top: event.clientY };
            const dropPos = view.posAtCoords(coords);

            // Use the 'inside' position if available, otherwise fall back to 'pos'
            const insertPosition =
              dropPos?.inside ?? dropPos?.pos ?? view.state.selection.from;

            // Prevent default and stop the event
            event.preventDefault();
            event.stopPropagation();

            try {
              let fileData = null;
              let markdownToInsert = "";

              // Handle custom JSON data from your file tree
              if (hasCustomData) {
                const fileDataStr =
                  event.dataTransfer!.getData("application/json");
                if (fileDataStr) {
                  fileData = JSON.parse(fileDataStr);
                  console.log("Custom file data received:", fileData);
                  markdownToInsert = onFileDrop(fileData);
                }
              }

              // Handle native file drops (from OS)
              else if (hasFiles && event.dataTransfer!.files.length > 0) {
                const files = Array.from(event.dataTransfer!.files);
                console.log("Native files dropped:", files);

                // Process each file
                files.forEach((file, index) => {
                  const fileInfo = {
                    id: `file-${Date.now()}-${index}`,
                    name: file.name,
                    type: "file",
                  };

                  const markdown = onFileDrop(fileInfo);
                  if (markdown) {
                    markdownToInsert += markdown;
                    markdownToInsert = markdownToInsert.trim();
                  }
                });
              }

              if (!markdownToInsert) {
                console.error("No markdown generated for dropped content");
                return true;
              }

              // Find the position where the drop occurred
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              console.log("Drop position resolved:", pos);

              // Use Milkdown's editor action to insert markdown properly
              // This approach uses the same context that Milkdown uses internally
              setTimeout(() => {
                if (crepe?.editor) {
                  try {
                    // Use insertMarkdownAtCursor which should handle parsing correctly
                    insertMarkdownAtCursor(crepe.editor, markdownToInsert, insertPosition);
                  } catch (error) {
                    console.error("Error using insertMarkdownAtCursor:", error);
                    // Fallback: use replaceAll if cursor insertion fails
                    crepe.editor.action((ctx) => {
                      const parser = ctx.get(parserCtx);
                      const view = ctx.get(editorViewCtx);
                      const doc = parser(markdownToInsert);
                      const { state } = view;
                      const tr = state.tr;
                      const insertPos = pos?.pos ?? state.selection.from;
                      tr.insert(insertPos, doc.content);
                      view.dispatch(tr);
                    });
                  }
                }
              }, 0);

              // Call the optional handler
              if (fileData) {
                actionHandlers.onFileDrop?.({
                  file: fileData,
                  markdown: markdownToInsert,
                });
              }

              // Return true to indicate we handled it
              return true;
            } catch (error) {
              console.error("Error handling file drop:", error);

              // Reset state on error
              isDraggingOver = false;
              dragCounter = 0;
              dropPosition = null;

              return true; // Still prevent default handling
            }
          },
        },
      },

      // Alternative: use view-level handlers which have even higher priority
      view: () => ({
        update: () => {},
        destroy: () => {},
      }),
    });
  });

  // Create editor instance
  function createEditor(node: HTMLElement): EditorInstance | undefined {
    try {
      crepe = new Crepe({
        root: node,
        defaultValue: config.defaultValue,
      });

      const plugins = createEditorPlugins(pluginConfig);

      // IMPORTANT: Add our file drop plugin FIRST, before Crepe's internal plugins
      crepe.editor
        .config((ctx) => {
          // Setup change listener
          ctx.get(listenerCtx).markdownUpdated((ctx, markdown) => {
            const changeEvent: EditorChangeEvent = {
              markdown,
              html: "", // You could get HTML if needed
            };
            actionHandlers.onChange?.(changeEvent);

            lastSetValue = markdown;
          });
        })
        // Add file drop plugin with high priority BEFORE other plugins
        //   .use(diagnosticPlugin)
        .use(fileDropPlugin)
        .use(listener)
        .use([...(plugins as MilkdownPlugin[])])
        .create()
        .then(() => {
          editorReady = true;
          actionHandlers.onReady?.();
          // console.log("Editor ready with high-priority file drop plugin");
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
    if (crepe && originalMarkdown) {
      crepe.editor.action(replaceAll(originalMarkdown));
    }
  });

  let lastSetValue = "";

  // Event handlers
  function handleLinkClick(event: LinkClickEvent) {
    console.log("Link clicked:", event);
    actionHandlers.onLinkClick?.(event);
  }

  function handleTaskMissing(path: string) {
    if (confirm(`Create new task: ${path}?`)) {
      console.log("Creating task:", path);
      const markdown = `\n[${path.split("/").pop()?.replace(".md", "") || "New Task"}](${path}.md)`;
      insertMarkdownAtCursor(crepe.editor, markdown);
    }
  }

  function handleContactMissing(path: string) {
    if (confirm(`Create new contact: ${path}?`)) {
      console.log("Creating contact:", path);
      const markdown = `\n[${path.split("/").pop()?.replace(".md", "") || "New Contact"}](${path}.md)`;
      insertMarkdownAtCursor(crepe.editor, markdown);
    }
  }

  function handleInternalMissing(path: string) {
    if (confirm(`Create new page: ${path}?`)) {
      console.log("Creating page:", path);
      const markdown = `\n[${path.split("/").pop()?.replace(".md", "") || "New Page"}](${path}.md)`;
      insertMarkdownAtCursor(crepe.editor, markdown);
    }
  }

  // Public methods (can be called from parent component)
  function insertMarkdown(markdown: string) {
    if (crepe) {
      insertMarkdownAtCursor(crepe.editor, markdown);
    }
  }

  function appendContent(markdown: string) {
    if (crepe) {
      appendMarkdown(crepe.editor, markdown);
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

  function setMarkdown(markdown: string) {
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


</script>

<style>
  .editor-wrapper {
    position: relative;
  }

  .editor-container {
    position: relative;
    transition: all 0.2s ease;
  }

  .editor-container.readonly {
    background-color: #f9fafb;
    cursor: not-allowed;
  }

  /* Drag over styles */
  .editor-container.drag-over {
    background-color: rgba(59, 130, 246, 0.05);
    border: 2px dashed #3b82f6;
    border-radius: 6px;
  }

  .drop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.1) 0%,
      rgba(139, 92, 246, 0.1) 100%
    );
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .drop-overlay.visible {
    opacity: 1;
  }

  .drop-message {
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-size: 16px;
    font-weight: 500;
    color: #3b82f6;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .drop-icon {
    font-size: 24px;
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
    padding: 1rem 10px 0 80px;
    min-height: 200px;
  }

  /* When dragging over, add visual feedback to the editor */
  .editor-container.drag-over :global(.milkdown .ProseMirror) {
    background-color: rgba(59, 130, 246, 0.02);
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

<div class="editor-wrapper">
  <!-- Toolbar (optional) -->
  {#if $$slots.toolbar}
    <div class="editor-toolbar">
      <slot
        name="toolbar"
        {insertMarkdown}
        {appendContent}
        {addSmartLink}
        {lastSetValue}
      />
    </div>
  {/if}

  <!-- Editor container - removed drag handlers to avoid interference -->
  <div
    bind:this={editorContainer}
    class="editor-container"
    class:readonly={config.readonly}
    class:drag-over={isDraggingOver}
  >
    <!-- Drop overlay for visual feedback -->
    <div class="drop-overlay" class:visible={isDraggingOver}>
      <div class="drop-message">
        <span class="drop-icon">📎</span>
        <span>Drop file to insert</span>
      </div>
    </div>

    <!-- The actual editor -->
    <div use:editor style="min-height: 200px"></div>
  </div>

  <!-- Status bar (optional) -->
  {#if $$slots.statusbar}
    <div class="editor-statusbar">
      <slot name="statusbar" {editorReady} {lastSetValue} />
    </div>
  {/if}
</div>
