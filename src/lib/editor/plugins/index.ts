// Re-export everything from sub-modules
export * from './links/index.js';

// Main configuration interface
import { createLinkPlugins, type LinkPluginConfig } from './links/index.js';

export interface EditorPluginConfig {
  links?: LinkPluginConfig;
}

export function createEditorPlugins(config: EditorPluginConfig = {}) {
  const plugins = [];

  // Add link plugins
  if (config.links) {
    plugins.push(...createLinkPlugins(config.links));
  }

  return plugins;
}