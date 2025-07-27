<script lang="ts">
  import { Crepe } from "@milkdown/crepe";
  import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
  import { $remark as _remark } from "@milkdown/kit/utils";
  import { visit } from "unist-util-visit";
  import "@milkdown/crepe/theme/common/style.css";
  import "@milkdown/crepe/theme/frame.css";
  import { $markSchema as _markSchema } from "@milkdown/kit/utils";
  import { type Node } from "unist";
  import { $inputRule as _inputRule } from "@milkdown/kit/utils";
  import { InputRule } from "@milkdown/prose/inputrules";
  import { markRule } from "@milkdown/kit/prose";
  import { commonmark, linkSchema } from "@milkdown/kit/preset/commonmark";
  import type { Ctx } from "@milkdown/ctx";

  import { $prose as _prose } from "@milkdown/kit/utils";
  import { Plugin, PluginKey } from "@milkdown/prose/state";
    import { DecorationSet } from "@milkdown/kit/prose/view";

  const linkTypeUpdatePlugin = _prose(() => {
    return new Plugin({
      key: new PluginKey("linkTypeUpdate"),
      appendTransaction(transactions, oldState, newState) {
        let tr = newState.tr;
        let modified = false;

        // Check if any transaction added or modified links
        transactions.forEach((transaction) => {
          transaction.steps.forEach((step) => {
            if (step.jsonID === "addMark" || step.jsonID === "replace") {
              // Walk through the document and update any links without proper linkType
              newState.doc.descendants((node, pos) => {
                node.marks.forEach((mark) => {
                  if (mark.type.name === "link") {
                    const expectedLinkType = classifyLink(mark.attrs.href);
                    if (
                      !mark.attrs.linkType ||
                      mark.attrs.linkType === "default"
                    ) {
                      console.log(
                        "Auto-updating link type for:",
                        mark.attrs.href,
                        "to:",
                        expectedLinkType,
                      );
                      const newMark = mark.type.create({
                        ...mark.attrs,
                        linkType: expectedLinkType,
                      });
                      const from = pos;
                      const to = pos + node.nodeSize;
                      tr = tr.removeMark(from, to, mark);
                      tr = tr.addMark(from, to, newMark);
                      modified = true;
                    }
                  }
                });
              });
            }
          });
        });

        return modified ? tr : null;
      },
    });
  });

  const customLinkSchema = linkSchema.extendSchema((prev) => {
    return (ctx: Ctx) => {
      console.log("Creating custom link schema");
      const originalSchema = prev(ctx);
      return {
        ...originalSchema,
        attrs: {
          ...originalSchema.attrs,
          linkType: { default: "default" },
        },
        parseDOM: [
          {
            tag: "a[href]",
            getAttrs(dom: HTMLElement | string) {
              console.log("parseDOM called for link");
              if (typeof dom === "string") return false;
              const href = dom.getAttribute("href");
              const title = dom.getAttribute("title");
              console.log("parseDOM link href:", href);
              return {
                href,
                title,
                linkType: classifyLink(href),
              };
            },
          },
        ],
        toDOM(mark: any) {
          console.log("toDOM called for link:", mark.attrs);
          return [
            "a",
            {
              href: mark.attrs.href,
              title: mark.attrs.title,
              "data-link-type": mark.attrs.linkType,
            },
          ];
        },
        parseMarkdown: {
          match: (node: any) => {
            const isMatch = node.type === "link";
            console.log(
              "parseMarkdown match called:",
              node.type,
              "isMatch:",
              isMatch,
            );
            return isMatch;
          },
          runner: (state: any, node: any, type: any) => {
            console.log("parseMarkdown runner called for link:", node);
            const url = node.url as string;
            const linkType = classifyLink(url);
            console.log(
              "Creating link with linkType:",
              linkType,
              "for URL:",
              url,
            );
            state.openMark(type, {
              href: url,
              title: node.title,
              linkType: linkType,
            });
            state.next(node.children);
            state.closeMark(type);
          },
        },
        toMarkdown: {
          match: (mark: any) => mark.type.name === "link",
          runner: (state: any, mark: any) => {
            state.withMark(mark, "link", undefined, {
              url: mark.attrs.href,
              title: mark.attrs.title,
            });
          },
        },
      };
    };
  });

  function classifyLink(href: string | null): string {
  console.log("classifyLink called with:", href);
  if (!href) return "default";
  
  // External links (start with http/https)
  if (href.startsWith("http://") || href.startsWith("https://")) return "external";
  
  // Email links
  if (href.startsWith("mailto:")) return "email";
  
  // Internal links - check for existence and type
  if (href.startsWith("tasks/")) {
    if (href.endsWith("?")) return "tasks-missing";
    return "tasks-file";
  }
  
  if (href.startsWith("contacts/")) {
    if (href.endsWith("?")) return "contacts-missing";
    return "contacts-file";
  }
  
  // Other internal links
  if (href.endsWith("/")) return "internal-folder";
  return "internal-file";
}

const linkTooltipPlugin = _prose(() => {
  let tooltip: HTMLElement | null = null;
  let currentLink: HTMLElement | null = null;

  return new Plugin({
    key: new PluginKey('linkTooltip'),
    
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, decorationSet) {
        return decorationSet.map(tr.mapping, tr.doc);
      }
    },

    view(editorView) {
      const createTooltip = () => {
        tooltip = document.createElement('div');
        tooltip.className = 'link-tooltip';
        tooltip.style.cssText = `
          position: absolute;
          z-index: 1000;
          background: #1f2937;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
          white-space: nowrap;
        `;
        document.body.appendChild(tooltip);
      };

      const showTooltip = (link: HTMLElement, event: MouseEvent) => {
        if (!tooltip) createTooltip();
        if (!tooltip) return;

        const href = link.getAttribute('href') || link.getAttribute('data-original-href');
        const linkType = link.getAttribute('data-link-type');
        const linkText = link.textContent || '';

        // Generate tooltip content based on link type
        const tooltipContent = generateTooltipContent(linkType, href, linkText);
        
        tooltip.innerHTML = tooltipContent;
        tooltip.style.opacity = '1';

        // Position tooltip
        positionTooltip(tooltip, event);
        currentLink = link;
      };

      const hideTooltip = () => {
        if (tooltip) {
          tooltip.style.opacity = '0';
          currentLink = null;
        }
      };

      const handleMouseEnter = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a');
        
        if (link && link !== currentLink) {
          // Delay showing tooltip to avoid flicker
          setTimeout(() => {
            if (link.matches(':hover')) {
              showTooltip(link, event);
            }
          }, 300);
        }
      };

      const handleMouseLeave = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a');
        
        if (link === currentLink) {
          hideTooltip();
        }
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (tooltip && tooltip.style.opacity === '1') {
          positionTooltip(tooltip, event);
        }
      };

      // Add event listeners
      const editorDOM = editorView.dom;
      editorDOM.addEventListener('mouseenter', handleMouseEnter, true);
      editorDOM.addEventListener('mouseleave', handleMouseLeave, true);
      editorDOM.addEventListener('mousemove', handleMouseMove);

      return {
        destroy() {
          editorDOM.removeEventListener('mouseenter', handleMouseEnter, true);
          editorDOM.removeEventListener('mouseleave', handleMouseLeave, true);
          editorDOM.removeEventListener('mousemove', handleMouseMove);
          
          if (tooltip) {
            document.body.removeChild(tooltip);
            tooltip = null;
          }
        }
      };
    }
  });
});

function generateTooltipContent(linkType: string | null, href: string | null, linkText: string): string {
  if (!linkType || !href) return `<div>Link: ${linkText}</div>`;

  switch (linkType) {
    case 'tasks-file':
      return `
        <div style="color: #a78bfa; font-weight: bold;">📄 Task File</div>
        <div style="margin-top: 4px;">Path: ${href}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to open task</div>
      `;

    case 'tasks-folder':
      return `
        <div style="color: #a78bfa; font-weight: bold;">📁 Task Folder</div>
        <div style="margin-top: 4px;">Path: ${href}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to browse tasks</div>
      `;

    case 'tasks-missing':
      const taskPath = href.replace('?', '');
      return `
        <div style="color: #fbbf24; font-weight: bold;">❓ Missing Task</div>
        <div style="margin-top: 4px;">Would create: ${taskPath}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to create new task</div>
      `;

    case 'contacts-file':
      return `
        <div style="color: #60a5fa; font-weight: bold;">👤 Contact</div>
        <div style="margin-top: 4px;">Path: ${href}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to view contact details</div>
      `;

    case 'contacts-folder':
      return `
        <div style="color: #60a5fa; font-weight: bold;">👥 Contact Group</div>
        <div style="margin-top: 4px;">Path: ${href}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to browse contacts</div>
      `;

    case 'contacts-missing':
      const contactPath = href.replace('?', '');
      return `
        <div style="color: #fbbf24; font-weight: bold;">❓ Missing Contact</div>
        <div style="margin-top: 4px;">Would create: ${contactPath}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to create new contact</div>
      `;

    case 'internal-file':
      return `
        <div style="color: #9ca3af; font-weight: bold;">📄 Internal Page</div>
        <div style="margin-top: 4px;">Path: ${href}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to navigate</div>
      `;

    case 'internal-folder':
      return `
        <div style="color: #9ca3af; font-weight: bold;">📁 Internal Folder</div>
        <div style="margin-top: 4px;">Path: ${href}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to browse</div>
      `;

    case 'internal-missing':
      const internalPath = href.replace('?', '');
      return `
        <div style="color: #fbbf24; font-weight: bold;">❓ Missing Page</div>
        <div style="margin-top: 4px;">Would create: ${internalPath}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to create new page</div>
      `;

    case 'external':
      const domain = extractDomain(href);
      return `
        <div style="color: #f87171; font-weight: bold;">🌐 External Link</div>
        <div style="margin-top: 4px;">Domain: ${domain}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Opens in new tab</div>
      `;

    case 'email':
      const email = href.replace('mailto:', '');
      return `
        <div style="color: #34d399; font-weight: bold;">✉️ Email</div>
        <div style="margin-top: 4px;">${email}</div>
        <div style="margin-top: 2px; opacity: 0.8;">Click to compose email</div>
      `;

    default:
      return `
        <div style="font-weight: bold;">🔗 Link</div>
        <div style="margin-top: 4px;">${href}</div>
      `;
  }
}

function positionTooltip(tooltip: HTMLElement, event: MouseEvent) {
  const x = event.clientX;
  const y = event.clientY;
  
  // Position tooltip above cursor with some offset
  tooltip.style.left = `${x - tooltip.offsetWidth / 2}px`;
  tooltip.style.top = `${y - tooltip.offsetHeight - 10}px`;
  
  // Keep tooltip within viewport
  const rect = tooltip.getBoundingClientRect();
  if (rect.left < 0) {
    tooltip.style.left = '10px';
  }
  if (rect.right > window.innerWidth) {
    tooltip.style.left = `${window.innerWidth - tooltip.offsetWidth - 10}px`;
  }
  if (rect.top < 0) {
    tooltip.style.top = `${y + 20}px`; // Show below cursor instead
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
  const linkClickHandlerPlugin = _prose(() => {
  return new Plugin({
    key: new PluginKey('linkClickHandler'),
    view(editorView) {
      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a');
        
        if (!link) return;

        const href = link.getAttribute('href');
        const linkType = link.getAttribute('data-link-type');
        
        console.log('Link clicked:', href, 'type:', linkType);

        // Handle different link types
        switch (linkType) {
          case 'tasks-file':
          case 'tasks-folder':
            event.preventDefault(); // Prevent default navigation
            event.stopPropagation();
            console.log('Opening task:', href);
            openTaskPanel(href);
            return;

          case 'tasks-missing':
            event.preventDefault();
            event.stopPropagation();
            console.log('Creating new task:', href);
            const taskPath = href?.replace('?', '');
            createNewTask(taskPath);
            return;

          case 'contacts-file':
            event.preventDefault();
            event.stopPropagation();
            console.log('Opening contact:', href);
            openContactPanel(href);
            return;

          case 'contacts-missing':
            event.preventDefault();
            event.stopPropagation();
            console.log('Creating new contact:', href);
            const contactPath = href?.replace('?', '');
            createNewContact(contactPath);
            return;

          case 'internal-missing':
            event.preventDefault();
            event.stopPropagation();
            console.log('Creating new page:', href);
            const pagePath = href?.replace('?', '');
            createNewPage(pagePath);
            return;

          case 'external':
            // Let external links behave normally or customize
            if (href?.startsWith('http')) {
              event.preventDefault();
              window.open(href, '_blank', 'noopener,noreferrer');
              return;
            }
            break;

          default:
            // For other internal links
            if (linkType?.includes('internal') || linkType?.includes('tasks') || linkType?.includes('contacts')) {
              event.preventDefault();
              event.stopPropagation();
              console.log('Navigating to internal page:', href);
              navigateToPage(href);
              return;
            }
        }
      };

      // Add event listener to the editor DOM
      const editorDOM = editorView.dom;
      editorDOM.addEventListener('click', handleClick, true); // Use capture phase

      return {
        destroy() {
          editorDOM.removeEventListener('click', handleClick, true);
        }
      };
    }
  });
});

// Dummy functions for custom behaviors
function openTaskPanel(href: string | null) {
  alert(`Opening task panel for: ${href}`);
  // In real app: open a side panel, modal, or navigate to task view
}

function createNewTask(path: string | null) {
  if (confirm(`Create new task at: ${path}?`)) {
    alert(`Creating task: ${path}`);
    // In real app: create the task file/entry and navigate to it
  }
}

function openContactPanel(href: string | null) {
  alert(`Opening contact: ${href}`);
  // In real app: open contact details panel
}

function createNewContact(path: string | null) {
  if (confirm(`Create new contact at: ${path}?`)) {
    alert(`Creating contact: ${path}`);
    // In real app: open new contact form
  }
}

function createNewPage(path: string | null) {
  if (confirm(`Create new page at: ${path}?`)) {
    alert(`Creating page: ${path}`);
    // In real app: create the page and navigate to it
  }
}

function navigateToPage(href: string | null) {
  alert(`Navigating to: ${href}`);
  // In real app: use your router to navigate to the page
}

  let crepe: Crepe | undefined = $state(undefined);

  function editor(node: HTMLElement) {
    crepe = new Crepe({
      root: node,
        features: {
            [Crepe.Feature.LinkTooltip]: false,
        },
      defaultValue: `# Link Type Testing

## Tasks Links
- Existing task file: [My Task](tasks/project1.md)
- Task folder: [Archive](tasks/archive/)
- Missing task: [Non-existent Task](tasks/missing-task?)

## Contacts Links
- Contact file: [John Doe](contacts/john.md)
- Contacts folder: [Team Directory](contacts/team/)
- Missing contact: [Unknown Person](contacts/unknown?)

## Other Internal Links
- Internal file: [Notes](notes/meeting.md)
- Internal folder: [Documents](docs/)
- Missing internal: [Broken Link](missing-page?)

## External Links
- GitHub: [My Repo](https://github.com/user/repo)
- Stack Overflow: [Question](https://stackoverflow.com/questions/123)
- General external: [Google](https://google.com)

## Email Links
- Contact me: [Email](mailto:test@example.com)

Test typing new links:
- Type: \`[New Task](tasks/new-task.md)\`
- Type: \`[New Folder](tasks/projects/)\`
- Type: \`[Missing](tasks/missing?)\`
`,
    });

    crepe.editor
      .config((ctx) => {})
      .use(customLinkSchema) // Use custom link schema BEFORE commonmark
      .use(linkTypeUpdatePlugin) // Use custom link schema BEFORE commonmark
      .use(linkClickHandlerPlugin)
      .use(linkTooltipPlugin)
      .create();

    crepe.create();

    console.log("crepe created");

    return {
      destroy() {
        crepe?.destroy();
        crepe = undefined;
      },
    };
  }
</script>

<div
  use:editor
  style="min-height: 200px; border: 1px solid #ccc; padding: 1rem;"
></div>
