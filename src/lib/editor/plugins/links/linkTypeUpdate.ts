import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/prose/state";
import { classifyLink } from "./linkClassification.js";

export const linkTypeUpdatePlugin = $prose(() => {
  return new Plugin({
    key: new PluginKey('linkTypeUpdate'),
    appendTransaction(transactions, oldState, newState) {
      let tr = newState.tr;
      let modified = false;

      // Check if any transaction added or modified links
      transactions.forEach(transaction => {
        transaction.steps.forEach(step => {
            if (step.jsonID === 'addMark' || step.jsonID === 'replace') {
            // Walk through the document and update any links without proper linkType
            newState.doc.descendants((node, pos) => {
              node.marks.forEach((mark) => {
                if (mark.type.name === 'link') {
                  const expectedLinkType = classifyLink(mark.attrs.href);
                  if (!mark.attrs.linkType || mark.attrs.linkType === 'default') {
                    console.log('Auto-updating link type for:', mark.attrs.href, 'to:', expectedLinkType);
                    const newMark = mark.type.create({
                      ...mark.attrs,
                      linkType: expectedLinkType
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
    }
  });
});