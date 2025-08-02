<script lang="ts">
  import FileExplorer from '$components/files/FileExplorer.svelte';
  
  // State for the selected file/item
  let selectedFile = $state<{ id: string; name: string; type: string } | null>(null);
  let fileContent = $state<string>('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Debug info
  let debugInfo = $state<Array<{ timestamp: string; message: string; data?: any }>>([]);
  let showDebugPanel = $state(false);

  function addDebugLog(message: string, data?: any) {
      const timestamp = new Date().toLocaleTimeString();
      debugInfo = [{ timestamp, message, data }, ...debugInfo.slice(0, 49)]; // Keep last 50 logs
      console.log(`[Page] ${message}`, data || '');
  }

  async function handleFileSelect(file: { id: string; name: string; type: string }) {
      selectedFile = file;
      error = null;
      addDebugLog(`File selected: ${file.name} (${file.type})`, file);

      // If it's a file, try to load its content
      if (file.type === 'file') {
          loading = true;
          try {
              addDebugLog(`Loading content for file: ${file.id}`);
              
              const response = await fetch(`/api/items/${file.id}/content`);
              if (!response.ok) {
                  throw new Error(`Failed to load file content: ${response.statusText}`);
              }
              
              fileContent = await response.text();
              addDebugLog(`Content loaded successfully, length: ${fileContent.length} characters`);
              
          } catch (err: any) {
              error = err.message;
              fileContent = '';
              addDebugLog(`Error loading file content: ${err.message}`, err);
          } finally {
              loading = false;
          }
      } else {
          // For folders and links, clear content
          fileContent = '';
          addDebugLog(`Selected non-file item: ${file.type}`);
      }
  }

  function clearSelection() {
      selectedFile = null;
      fileContent = '';
      error = null;
      addDebugLog('Selection cleared');
  }

  function toggleDebugPanel() {
      showDebugPanel = !showDebugPanel;
  }

  function clearDebugLog() {
      debugInfo = [];
      addDebugLog('Debug log cleared');
  }

  // Add initial debug log
  addDebugLog('File system page initialized');
</script>

<svelte:head>
  <title>File System - Drag & Drop Demo</title>
  <meta name="description" content="Drag and drop file system demonstration" />
</svelte:head>

<div class="page-container">
  <header class="page-header">
      <h1>📁 File System Explorer</h1>
      <p class="subtitle">Drag and drop files and folders to organize your content</p>
      
      <div class="header-actions">
          <button 
              class="debug-toggle"
              class:active={showDebugPanel}
              onclick={toggleDebugPanel}
          >
              🐛 Debug Panel
          </button>
          
          {#if selectedFile}
              <button class="clear-selection" onclick={clearSelection}>
                  ✕ Clear Selection
              </button>
          {/if}
      </div>
  </header>

  <main class="main-content">
      <div class="sidebar">
          <FileExplorer onFileSelect={handleFileSelect} />
      </div>

      <div class="content-area">
          {#if selectedFile}
              <div class="selected-item">
                  <div class="item-header">
                      <h2>
                          <span class="item-icon">
                              {selectedFile.type === "folder" ? "📁" : selectedFile.type === "link" ? "🔗" : "📄"}
                          </span>
                          {selectedFile.name}
                      </h2>
                      <span class="item-type">{selectedFile.type}</span>
                  </div>

                  {#if selectedFile.type === 'file'}
                      <div class="file-content">
                          <h3>Content:</h3>
                          {#if loading}
                              <div class="loading-content">
                                  <span class="spinner">⏳</span>
                                  Loading file content...
                              </div>
                          {:else if error}
                              <div class="error-content">
                                  <span class="error-icon">⚠️</span>
                                  Error: {error}
                              </div>
                          {:else if fileContent}
                              <pre class="content-display">{fileContent}</pre>
                          {:else}
                              <div class="empty-content">
                                  <span class="empty-icon">📝</span>
                                  File appears to be empty
                              </div>
                          {/if}
                      </div>
                  {:else if selectedFile.type === 'folder'}
                      <div class="folder-info">
                          <p>📂 This is a folder. Expand it in the file explorer to see its contents.</p>
                          <p>💡 You can drag other files and folders into this folder to organize them.</p>
                      </div>
                  {:else if selectedFile.type === 'link'}
                      <div class="link-info">
                          <p>🔗 This is a link item.</p>
                          <p>ID: <code>{selectedFile.id}</code></p>
                      </div>
                  {/if}
              </div>
          {:else}
              <div class="welcome-message">
                  <div class="welcome-content">
                      <h2>👋 Welcome to the File System!</h2>
                      <p>Select a file or folder from the explorer to view its details.</p>
                      
                      <div class="instructions">
                          <h3>🎯 How to use:</h3>
                          <ul>
                              <li><strong>📁 Browse:</strong> Click folders to expand/collapse</li>
                              <li><strong>📄 Select:</strong> Click files to view their content</li>
                              <li><strong>🖱️ Drag & Drop:</strong> Drag items to reorganize them</li>
                              <li><strong>🏠 Move to Root:</strong> Drop items in the root drop zone</li>
                              <li><strong>🗑️ Delete:</strong> Use the trash icon when hovering over items</li>
                          </ul>
                      </div>

                      <div class="features">
                          <h3>✨ Features:</h3>
                          <ul>
                              <li>Real-time drag and drop with visual feedback</li>
                              <li>Auto-expanding folders when items are dropped</li>
                              <li>Root-level organization with dedicated drop zone</li>
                              <li>Comprehensive debug logging (check console)</li>
                          </ul>
                      </div>
                  </div>
              </div>
          {/if}
      </div>
  </main>

  {#if showDebugPanel}
      <div class="debug-panel">
          <div class="debug-header">
              <h3>🐛 Debug Log</h3>
              <div class="debug-actions">
                  <button onclick={clearDebugLog} class="clear-debug">Clear</button>
                  <button onclick={() => showDebugPanel = false} class="close-debug">✕</button>
              </div>
          </div>
          
          <div class="debug-content">
              {#if debugInfo.length === 0}
                  <div class="no-logs">No debug logs yet...</div>
              {:else}
                  {#each debugInfo as log}
                      <div class="debug-entry">
                          <span class="debug-timestamp">{log.timestamp}</span>
                          <span class="debug-message">{log.message}</span>
                          {#if log.data}
                              <pre class="debug-data">{JSON.stringify(log.data, null, 2)}</pre>
                          {/if}
                      </div>
                  {/each}
              {/if}
          </div>
      </div>
  {/if}
</div>

<style>
  .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .page-header {
      text-align: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .page-header h1 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-size: 2.5rem;
      font-weight: 700;
  }

  .subtitle {
      color: #7f8c8d;
      margin: 0 0 20px 0;
      font-size: 1.1rem;
  }

  .header-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
  }

  .debug-toggle, .clear-selection {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
  }

  .debug-toggle {
      background: #3498db;
      color: white;
  }

  .debug-toggle:hover {
      background: #2980b9;
      transform: translateY(-1px);
  }

  .debug-toggle.active {
      background: #e74c3c;
  }

  .clear-selection {
      background: #95a5a6;
      color: white;
  }

  .clear-selection:hover {
      background: #7f8c8d;
      transform: translateY(-1px);
  }

  .main-content {
      display: flex;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
      align-items: flex-start;
  }

  .sidebar {
      flex-shrink: 0;
  }

  .content-area {
      flex: 1;
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      min-height: 500px;
  }

  .selected-item {
      animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
      from {
          opacity: 0;
          transform: translateY(10px);
      }
      to {
          opacity: 1;
          transform: translateY(0);
      }
  }

  .item-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #ecf0f1;
  }

  .item-header h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #2c3e50;
      flex: 1;
  }

  .item-icon {
      font-size: 1.5rem;
  }

  .item-type {
      background: #3498db;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
  }

  .file-content h3 {
      color: #2c3e50;
      margin-bottom: 12px;
  }

  .content-display {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      max-height: 400px;
      overflow: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
  }

  .loading-content, .error-content, .empty-content {
      padding: 20px;
      text-align: center;
      border-radius: 6px;
      margin: 12px 0;
  }

  .loading-content {
      background: #e3f2fd;
      color: #1976d2;
  }

  .error-content {
      background: #ffebee;
      color: #c62828;
  }

  .empty-content {
      background: #f5f5f5;
      color: #666;
  }

  .folder-info, .link-info {
      background: #f8f9fa;
      border-left: 4px solid #3498db;
      padding: 16px;
      border-radius: 0 6px 6px 0;
  }

  .folder-info p, .link-info p {
      margin: 8px 0;
      color: #2c3e50;
  }

  .welcome-message {
      text-align: center;
      padding: 40px 20px;
  }

  .welcome-content h2 {
      color: #2c3e50;
      margin-bottom: 16px;
      font-size: 2rem;
  }

  .welcome-content > p {
      color: #7f8c8d;
      font-size: 1.1rem;
      margin-bottom: 30px;
  }

  .instructions, .features {
      text-align: left;
      max-width: 600px;
      margin: 0 auto 30px;
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
  }

  .instructions h3, .features h3 {
      color: #2c3e50;
      margin-bottom: 12px;
  }

  .instructions ul, .features ul {
      color: #2c3e50;
      line-height: 1.6;
  }

  .instructions li, .features li {
      margin-bottom: 8px;
  }

  .debug-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 400px;
      max-height: 50vh;
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      border: 1px solid #e0e0e0;
      z-index: 1000;
  }

  .debug-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #2c3e50;
      color: white;
      border-radius: 8px 8px 0 0;
  }

  .debug-header h3 {
      margin: 0;
      font-size: 14px;
  }

  .debug-actions {
      display: flex;
      gap: 8px;
  }

  .clear-debug, .close-debug {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
  }

  .clear-debug:hover, .close-debug:hover {
      background: rgba(255, 255, 255, 0.1);
  }

  .debug-content {
      max-height: 300px;
      overflow-y: auto;
      padding: 8px;
  }

  .no-logs {
      text-align: center;
      color: #666;
      padding: 20px;
      font-style: italic;
  }

  .debug-entry {
      border-bottom: 1px solid #f0f0f0;
      padding: 8px;
      font-size: 12px;
  }

  .debug-timestamp {
      color: #666;
      font-weight: 500;
  }

  .debug-message {
      color: #2c3e50;
      margin-left: 8px;
  }

  .debug-data {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 8px;
      margin-top: 4px;
      font-size: 10px;
      overflow-x: auto;
  }

  @media (max-width: 768px) {
      .main-content {
          flex-direction: column;
      }

      .debug-panel {
          width: calc(100vw - 40px);
          right: 20px;
          left: 20px;
      }

      .page-header h1 {
          font-size: 2rem;
      }
  }
</style>