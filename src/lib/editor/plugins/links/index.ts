// Export all link-related functionality
export { classifyLink, linkTypeStyles } from './linkClassification.js';
export type { LinkType } from './linkClassification.js';

export { customLinkSchema } from './linkSchema.js';

export { createLinkClickHandlerPlugin } from './linkClickHandler.js';
export type { LinkActionHandlers } from './linkClickHandler.js';

export { linkTypeUpdatePlugin } from './linkTypeUpdate.js';

export { linkTooltipPlugin } from './linkTooltip.js';

// Convenience function to setup all link plugins at once
import { customLinkSchema } from './linkSchema.js';
import { linkTypeUpdatePlugin } from './linkTypeUpdate.js';
import { createLinkClickHandlerPlugin, type LinkActionHandlers } from './linkClickHandler.js';
import { linkTooltipPlugin } from './linkTooltip.js';

export interface LinkPluginConfig {
  enableTooltip?: boolean;
  clickHandlers?: LinkActionHandlers;
}

export function createLinkPlugins(config: LinkPluginConfig = {}) {
  const plugins = [
    customLinkSchema,
    linkTypeUpdatePlugin,
  ];

  if (config.clickHandlers) {
    plugins.push(createLinkClickHandlerPlugin(config.clickHandlers));
  }

  if (config.enableTooltip !== false) {
    plugins.push(linkTooltipPlugin);
  }

  return plugins;
}