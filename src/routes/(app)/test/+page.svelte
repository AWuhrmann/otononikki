<script lang="ts">
  import { browser } from "$app/environment";
  import Fuse from "fuse.js";
  import { Link } from "lucide-svelte";

  // Initial dummy text
  const initialText = "";

  class Token {
    type: string = "word";
    content: string | null = null;
  }

  async function parseTokens(text: string): Promise<Token[]> {
    if (!browser || !text.trim()) return [];

    try {
      const response = await fetch("/api/annotate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error("API response not ok:", response.status);
        return fallbackTokenization(text);
      }

      const content = await response.json();
      console.log("Full API response:", content);

      let cleaned = content.annotation.content;

      const jsonMatch = content.annotation.content.match(
        /```json\s*([\s\S]*?)\s*```/i,
      );
      if (jsonMatch) {
        cleaned = jsonMatch[1];
        console.log("Extracted JSON from code block:", cleaned);
      }

      console.log("cleaned", cleaned);

      cleaned = JSON.parse(cleaned);

      // Extract data from content — expect structured JSON now
      const contacts: string[] = cleaned?.contacts || [];

      const tasks: { text: string; description?: string }[] =
        cleaned?.tasks || [];

      console.log(contacts);
      console.log(tasks);
      mentionnedContacts.length = 0;
      mentionnedContacts.push(...contacts);

      // Safeguard fallback
      if (!Array.isArray(contacts) || !Array.isArray(tasks)) {
        console.error("Invalid response format");
        return fallbackTokenization(text);
      }

      const tokens_: Token[] = [];
      tokens.length = 0;

      // Helper to consume and push segments
      function pushWordSegments(segment: string) {
        const parts = segment.split(/(\s+)/);
        for (const part of parts) {
          if (part) tokens_.push({ type: "word", content: part });
        }
      }

      // Sort tags by position in text
      const allSpans: { type: "contact" | "task"; value: string }[] = [
        ...contacts.map((c) => ({ type: "contact", value: c })),
        ...tasks.map((t) => ({ type: "task", value: t.text })),
      ].filter((item) => text.includes(item.value)); // filter out missing

      // Sort by first appearance in the text
      allSpans.sort((a, b) => text.indexOf(a.value) - text.indexOf(b.value));

      let cursor = 0;

      for (const span of allSpans) {
        const index = text.indexOf(span.value, cursor);
        if (index === -1) continue;

        const before = text.slice(cursor, index);
        if (before) pushWordSegments(before);

        tokens_.push({ type: span.type, content: span.value });
        cursor = index + span.value.length;
      }

      const after = text.slice(cursor);
      if (after) pushWordSegments(after);

      console.log("Final parsed tokens_:", tokens_);
      tokens.push(...tokens_);

      connectContacts();

      return tokens_;
    } catch (error) {
      console.error("Error in parseTokens:", error);
      return fallbackTokenization(text);
    }
  }

  // Fallback tokenization (your original logic)
  function fallbackTokenization(text: string): Token[] {
    const words = text.split(/(\s+)/); // Split but keep whitespace
    return words.map((word) => {
      const trimmed = word.trim();
      if (trimmed.length > 0 && /^[A-Z][a-z]+$/.test(trimmed)) {
        return { type: "contact", content: word };
      }
      return { type: "word", content: word };
    });
  }

  // The text provides some of the contacts encountered. Some of them might be in the bank already, so we suggest linking them to the user.
  function connectContacts() {
    const fuse = new Fuse(allContacts, {
      includeScore: true,
      threshold: 0.3, // Adjust for desired fuzziness
    });
    const matchedContacts = mentionnedContacts.map((contact) => {
      const results = fuse.search(contact);
      if (results.length > 0) {
        return {
          mentionned: contact,
          matches: results
            .filter(
              (result) => result.score !== undefined && result.score <= 0.3,
            )
            .map((result) => result.item),
        };
      }
      return { mentionned: contact, matches: [] };
    });

    contactMatches = {};
    matchedContacts.forEach((match) => {
      contactMatches[match.mentionned] = match.matches;
    });

    console.log("Matched Contacts:", matchedContacts);
    return matchedContacts;
  }

  import { onMount } from "svelte";

  onMount(async () => {
    try {
      const response = await fetch("/api/contacts/get");
      if (!response.ok) {
        console.error("Failed to fetch contacts:", response.status);
        return;
      }

      allContacts = await response.json();
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  });

  // Reactive state using Svelte 5 runes
  let tokens = $state<Token[]>([]);

  $effect(() => {
    console.log("Reactivity watch: tokens updated", tokens);
  });

  let allContacts = $state<string[]>([]);
  let mentionnedContacts = $state<string[]>([]);
  let contactMatches = $state<Record<string, string[]>>({});

  let editorRef = $state(null);
  let hiddenTextRef = $state<HTMLTextAreaElement | null>(null);
  let currentText = $state(initialText);
  let isComposing = $state(false);

  // Selection popup state
  let showPopup = $state(false);
  let popupPosition = $state({ x: 0, y: 0 });
  let selectedText = $state("");
  let selectionRange = $state(null);

  function handleContactClick(contactName) {
    console.log("Clicked contact:", contactName.trim());
  }

  // Handle text selection for popup
  function handleMouseUp(event) {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedTextContent = selection.toString().trim();

      if (selectedTextContent && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Position popup near the selection
        popupPosition = {
          x: rect.left + rect.width / 2,
          y: rect.bottom + window.scrollY + 8,
        };

        selectedText = selectedTextContent;
        selectionRange = range.cloneRange();
        showPopup = true;
      } else {
        hidePopup();
      }
    }, 10);
  }

  function hidePopup() {
    showPopup = false;
    selectedText = "";
    selectionRange = null;
  }

  // Popup action handlers
  function handleMakeContact() {
    if (selectedText) {
      console.log("Making contact from:", selectedText);
    }
    hidePopup();
  }

  function handleHighlight() {
    if (selectedText) {
      console.log("Highlighting:", selectedText);
    }
    hidePopup();
  }

  function handleCopy() {
    if (selectedText) {
      navigator.clipboard
        .writeText(selectedText)
        .then(() => {
          console.log("Copied to clipboard:", selectedText);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    }
    hidePopup();
  }

  function handleSearch() {
    if (selectedText) {
      console.log("Searching for:", selectedText);
    }
    hidePopup();
  }

  // Close popup when clicking outside
  function handleDocumentClick(event) {
    if (showPopup && !event.target.closest(".popup")) {
      hidePopup();
    }
  }

  // Handle keyboard events
  function handleKeyDown(event) {
    // Hide popup on escape
    if (event.key === "Escape") {
      hidePopup();
    }
  }

  // Sync textarea value with tokens when tokens change externally
  function syncTextareaFromTokens() {
    if (hiddenTextRef && !isComposing) {
      const newText = tokens.map((t) => t.content).join("");
      if (hiddenTextRef.value !== newText) {
        hiddenTextRef.value = newText;
        currentText = newText;
      }
    }
  }

  // Watch for external token changes
  $effect(() => {
    syncTextareaFromTokens();
  });

  // Add document click listener
  $effect(() => {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  });
</script>

<style>
  textarea:focus {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }

  .popup {
    min-width: 160px;
  }

  .popup button {
    font-family: inherit;
  }

  .popup button:hover {
    background-color: #f3f4f6;
  }
</style>

<div class="p-6 max-w-4xl mx-auto">
  <h2 class="text-2xl font-bold mb-4">
    Editable Token Text Editor with Selection Popup
  </h2>

  <div class="bg-gray-50 p-4 rounded-lg mb-4">
    <h3 class="font-semibold mb-2">Instructions:</h3>
    <ul class="text-sm text-gray-600 space-y-1">
      <li>• Edit the text naturally in the text area</li>
      <li>
        • Click on highlighted names in the preview to log them to console
      </li>
      <li>
        • <strong
          >Select any text in the preview to see popup with options</strong
        >
      </li>
      <li>
        • Names (capitalized words) are automatically detected as contacts
      </li>
      <li>• Token parsing happens after you stop typing for 500ms</li>
      <li>• Press Escape to close popup</li>
    </ul>
  </div>

  <div class="space-y-4">
    <!-- Editable textarea -->
    <div class="relative">
      <p class="block text-sm font-medium text-gray-700 mb-2">Edit text:</p>
      <textarea
        bind:this={hiddenTextRef}
        bind:value={currentText}
        class="w-full p-4 border-2 border-gray-200 rounded-lg min-h-24 bg-white focus:border-blue-400 focus:outline-none resize-y font-mono text-sm"
        placeholder="Type your text here..."
      ></textarea>
    </div>

    <!-- Visual preview with clickable tokens -->
    <div class="relative">
      <button
        onclick={async () => {
          parseTokens(currentText);
          console.log("tokens", tokens);
        }}>AI Parse</button
      >
      <label
        for="Preview of element"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Preview with clickable contacts (select text for options):
      </label>
      <div
        bind:this={editorRef}
        role="button"
        tabindex="0"
        class="w-full p-4 border-2 border-gray-200 rounded-lg min-h-24 bg-gray-50 select-text"
        style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.875rem; user-select: text;"
        onmouseup={handleMouseUp}
      >
        {#each tokens as token, index}
          {#if token.type === "contact"}
            <span class="inline-flex items-center gap-1">
              <span
                class="bg-blue-100 border border-blue-300 rounded px-1 py-0.5 cursor-pointer hover:bg-blue-200 transition-colors inline-block"
                role="button"
                tabindex="0"
                onclick={() => handleContactClick(token.content)}
                onkeydown={(e) =>
                  e.key === "Enter" && handleContactClick(token.content)}
                >{token.content}</span
              >
            </span>
          {:else}
            <span class="inline">{token.content}</span>
          {/if}
        {/each}
      </div>

      <!-- Selection Popup -->
      {#if showPopup}
        <div
          class="popup fixed bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50"
          style="left: {popupPosition.x}px; top: {popupPosition.y}px; transform: translateX(-50%);"
        >
          {#if mentionnedContacts.includes(selectedText) && contactMatches[selectedText].length > 0}
            <div class="px-3 py-2 border-t border-gray-200 mt-1">
              <strong class="text-sm">Quick actions:</strong>
              {#each contactMatches[selectedText] as match}
                <button
                  class="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer border-0 bg-transparent"
                >
                  <Link class="w-4 h-4" /> <span>{match}</span>
                </button>
              {/each}
            </div>
            <div
              class="px-3 py-1 text-xs text-gray-500 border-t border-gray-200 mt-1"
            ></div>
          {/if}
          <button
            class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-0 bg-transparent"
            onclick={handleMakeContact}
          >
            📝 Make Contact
          </button>
          <button
            class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-0 bg-transparent"
            onclick={handleHighlight}
          >
            🖍️ Highlight
          </button>
          <button
            class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-0 bg-transparent"
            onclick={handleCopy}
          >
            📋 Copy
          </button>
          <button
            class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer border-0 bg-transparent"
            onclick={handleSearch}
          >
            🔍 Search
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>
