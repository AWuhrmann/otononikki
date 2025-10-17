import type { Crepe } from "@milkdown/crepe";
import type { Editor } from "@milkdown/core";
import type { LinkActionHandlers } from "../editor/plugins/links/linkClickHandler.js";
import type { LinkType } from "../editor/plugins/links/linkClassification.js";
import type { EditorAPI } from "$lib/editor/index.js";

// Re-export types from plugins for convenience
export type { LinkType } from "../editor/plugins/links/linkClassification.js";
export type { LinkActionHandlers } from "../editor/plugins/links/linkClickHandler.js";

// Editor instance types
export interface EditorInstance {
  crepe: Crepe;
  editor: Editor;
}

export interface Task {
  verbatim: string;
  summary: string;
  date: string;
}

// Configuration types
export interface EditorConfig {
  defaultValue?: string;
  placeholder?: string;
  readonly?: boolean;
  root?: HTMLElement;
}

export interface LinkPluginConfig {
  enableTooltip?: boolean;
  clickHandlers?: LinkActionHandlers;
}

export interface MarkPluginConfig {
  enabled?: boolean;
  defaultColor?: string;
}

export interface EditorPluginConfig {
  links?: LinkPluginConfig;
  marks?: MarkPluginConfig;
  highlights?: boolean;
}

// Command types
export type SmartLinkType = "task" | "contact" | "internal";

export interface LinkCommandOptions {
  text: string;
  linkType: SmartLinkType;
  exists?: boolean;
}

// Event types
export interface LinkClickEvent {
  href: string;
  linkType: LinkType;
  text: string;
  event: MouseEvent;
}

export interface EditorChangeEvent {
  markdown: string;
  html: string;
}

// Tooltip types
export interface TooltipPosition {
  x: number;
  y: number;
}

export interface TooltipContent {
  title: string;
  description: string;
  icon: string;
  color: string;
  actions?: string[];
}

// Mark types
export interface MarkNode {
  type: "mark";
  data?: {
    color?: string;
  };
  children: Array<{ type: string; value: string }>;
}

// Utility types for plugin development
export type PluginFactory<T = any> = (config?: T) => any;

export interface PluginRegistration {
  name: string;
  plugin: any;
  config?: any;
}

// Editor state types
export interface EditorState {
  isReady: boolean;
  markdown: string;
  html: string;
  selection?: {
    from: number;
    to: number;
  };
}

// Action handler types for external integrations
export interface EditorActionHandlers {
  onSave?: (markdown: string) => void | Promise<void>;
  onLoad?: () => string | Promise<string>;
  onLinkClick?: (event: LinkClickEvent) => void;
  onChange?: (event: EditorChangeEvent) => void;
  onReady?: (api: EditorAPI) => void;
  onFileDrop?: (
    file: { id: string; name: string; type: string },
    position?: number,
  ) => string;
}

// CSS class name constants
export const CSS_CLASSES = {
  EDITOR: "milkdown-editor",
  LINK: "milkdown-link",
  MARK: "milkdown-mark",
  TOOLTIP: "link-tooltip",
} as const;

// Link type style mapping
export interface LinkTypeStyle {
  color: string;
  icon: string;
  description: string;
  background?: string;
  borderColor?: string;
}

export type LinkTypeStyleMap = Record<LinkType, LinkTypeStyle>;

// Default values
export const DEFAULT_EDITOR_CONFIG: Required<EditorConfig> = {
  defaultValue: "# Welcome\n\nStart writing...",
  placeholder: "Type something...",
  readonly: false,
  root: document.body,
};

export const DEFAULT_PLUGIN_CONFIG: Required<EditorPluginConfig> = {
  links: {
    enableTooltip: true,
    clickHandlers: {},
  },
  marks: {
    enabled: true,
    defaultColor: "#ffff00",
  },
};

// Error types
export class EditorError extends Error {
  constructor(
    message: string,
    public code: string,
    public plugin?: string,
  ) {
    super(message);
    this.name = "EditorError";
  }
}

export class PluginError extends EditorError {
  constructor(message: string, pluginName: string) {
    super(message, "PLUGIN_ERROR", pluginName);
    this.name = "PluginError";
  }
}

// Utility type guards
export function isLinkType(value: string): value is LinkType {
  const linkTypes: LinkType[] = [
    "task",
    "task",
    "task-missing",
    "contact",
    "contact-missing",
    "internal-file",
    "internal-folder",
    "internal-missing",
    "external",
    "mail",
    "default",
  ];
  return linkTypes.includes(value as LinkType);
}

export function isSmartLinkType(value: string): value is SmartLinkType {
  return ["task", "contact", "internal"].includes(value);
}

