<script lang="ts">
    import type { LayoutData } from "./$types"
  
    let { data, children }: { data: LayoutData; children: Snippet } = $props()
  </script>
  
  <div class="flex-1 flex flex-col min-h-0">
    {@render children()}
  </div>    