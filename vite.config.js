import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3000,
    fs: {
      allow: ['/tmp'] // allow serving files from /tmp
    }
  },
  plugins: [sveltekit()],
})
