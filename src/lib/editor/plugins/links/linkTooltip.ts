
import {$prose as _prose} from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/prose/state";
import { DecorationSet } from "@milkdown/prose/view";
import type { LinkType } from "./linkClassification.js";
import { linkTypeStyles } from "./linkClassification.js";

export const linkTooltipPlugin = _prose(() => {
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
          const linkType = link.getAttribute('data-link-type') as LinkType;
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
  
  function generateTooltipContent(linkType: LinkType, href: string | null, linkText: string): string {
    if (!linkType || !href) return `<div>Link: ${linkText}</div>`;
    
    const style = linkTypeStyles[linkType as keyof typeof linkTypeStyles];
    const color = style?.color || '#ffffff';
    const icon = style?.icon || '🔗';

    return `
      <div style="color: ${color}; font-weight: bold;">${icon} ${linkType}</div>
      <div style="margin-top: 4px;">${href}</div>
      <div style="margin-top: 2px; opacity: 0.8;">Click to interact</div>
    `;
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
  
  export function extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }