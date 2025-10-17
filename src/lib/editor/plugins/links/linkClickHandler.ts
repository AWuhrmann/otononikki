import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/prose/state";
import type { LinkType } from "./linkClassification.js";

export interface LinkActionHandlers {
  onTaskFile?: (href: string) => void;
  onTaskFolder?: (href: string) => void;
  onTaskMissing?: (href: string) => void;
  onContactFile?: (href: string) => void;
  onContactFolder?: (href: string) => void;
  onContactMissing?: (href: string) => void;
  onInternalFile?: (href: string) => void;
  onInternalFolder?: (href: string) => void;
  onInternalMissing?: (href: string) => void;
  onExternal?: (href: string) => void;
  onEmail?: (href: string) => void;
}

export const createLinkClickHandlerPlugin = (
  handlers: LinkActionHandlers = {},
) => {
  return $prose(() => {
    return new Plugin({
      key: new PluginKey("linkClickHandler"),
      view(editorView) {
        const handleClick = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          const link = target.closest("a");

          if (!link) return;

          const href =
            link.getAttribute("href") ||
            link.getAttribute("data-original-href");
          const linkType = link.getAttribute("data-link-type") as LinkType;

          if (!href) return;

          console.log("Link clicked:", href, "type:", linkType);

          // Handle different link types
          switch (linkType as string) {
            case "task":
              event.preventDefault();
              event.stopPropagation();
              handlers.onTaskFile?.(href);
              break;

            case "task-missing":
              event.preventDefault();
              event.stopPropagation();
              const taskPath = href.replace("?", "");
              handlers.onTaskMissing?.(taskPath);
              break;

            case "contact-missing":
              event.preventDefault();
              event.stopPropagation();
              const contactPath = href.replace("?", "");
              handlers.onContactMissing?.(contactPath);
              break;

            case "internal-file":
              event.preventDefault();
              event.stopPropagation();
              handlers.onInternalFile?.(href);
              break;

            case "internal-folder":
              event.preventDefault();
              event.stopPropagation();
              handlers.onInternalFolder?.(href);
              break;

            case "internal-missing":
              event.preventDefault();
              event.stopPropagation();
              const internalPath = href.replace("?", "");
              handlers.onInternalMissing?.(internalPath);
              break;

            case "external":
              event.preventDefault();
              event.stopPropagation();
              if (href.startsWith("http")) {
                handlers.onExternal?.(href) ||
                  window.open(href, "_blank", "noopener,noreferrer");
              }
              break;

            case "email":
              // Let email links behave normally unless custom handler
              if (handlers.onEmail) {
                event.preventDefault();
                event.stopPropagation();
                handlers.onEmail(href);
              }
              break;
          }
        };

        // Add event listener to the editor DOM
        const editorDOM = editorView.dom;
        editorDOM.addEventListener("click", handleClick, true);

        return {
          destroy() {
            editorDOM.removeEventListener("click", handleClick, true);
          },
        };
      },
    });
  });
};

