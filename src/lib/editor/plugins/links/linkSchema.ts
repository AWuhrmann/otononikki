import { linkSchema } from "@milkdown/kit/preset/commonmark";
import type { Ctx } from "@milkdown/ctx";
import { classifyLink } from "./linkClassification.js";

export const customLinkSchema = linkSchema.extendSchema((prev) => {
  return (ctx: Ctx) => {
    console.log('Creating custom link schema');
    const originalSchema = prev(ctx);
    return {
      ...originalSchema,
      attrs: {
        ...originalSchema.attrs,
        linkType: { default: 'default' }
      },
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs(dom: HTMLElement | string) {
            console.log('parseDOM called for link');
            if (typeof dom === 'string') return false;
            const href = dom.getAttribute('href');
            const title = dom.getAttribute('title');
            console.log('parseDOM link href:', href);
            return {
              href,
              title,
              linkType: classifyLink(href)
            };
          }
        }
      ],
      toDOM(mark: any) {
        console.log('toDOM called for link:', mark.attrs);
        return [
          'a',
          {
            href: mark.attrs.href,
            title: mark.attrs.title,
            'data-link-type': mark.attrs.linkType
          }
        ];
      },
      parseMarkdown: {
        match: (node: any) => {
          const isMatch = node.type === 'link';
          console.log('parseMarkdown match called:', node.type, 'isMatch:', isMatch);
          return isMatch;
        },
        runner: (state: any, node: any, type: any) => {
          console.log('parseMarkdown runner called for link:', node);
          const url = node.url as string;
          const linkType = classifyLink(url);
          console.log('Creating link with linkType:', linkType, 'for URL:', url);
          state.openMark(type, { 
            href: url, 
            title: node.title,
            linkType: linkType
          });
          state.next(node.children);
          state.closeMark(type);
        }
      },
      toMarkdown: {
        match: (mark: any) => mark.type.name === 'link',
        runner: (state: any, mark: any) => {
          state.withMark(mark, 'link', undefined, {
            url: mark.attrs.href,
            title: mark.attrs.title
          });
        }
      }
    };
  };
});