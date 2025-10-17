// Export all command functionality
export {
  insertMarkdownAtCursor,
  appendMarkdown,
  replaceTextWithLinks,
  createSmartLink,
  convertSelectionToContactLink,
  autoLinkContent,
  insertMarkdownAfterPattern
} from "./linkCommands.js";

export { autoLinkFromLLM } from "./autoLinkFromLLM.js";

export type { SmartLinkType } from "./linkCommands.js";

