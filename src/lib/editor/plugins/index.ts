// Re-export everything from sub-modules
export * from "./links/index.js";
import { highlightPlugin } from "./highlights/highlight-plugin.js";

// Main configuration interface
import { createLinkPlugins, type LinkPluginConfig } from "./links/index.js";

export interface EditorPluginConfig {
  links?: LinkPluginConfig;
  highlights?: boolean;
}

export function createEditorPlugins(config: EditorPluginConfig = {}) {
  const plugins = [];

  // Add link plugins
  if (config.links) {
    plugins.push(...createLinkPlugins(config.links));
  }

  if (config.highlights !== false) {
    plugins.push(highlightPlugin);
  }

  return plugins;
}

