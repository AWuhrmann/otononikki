import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 3000,
    fs: {
      allow: ['/tmp'] // allow serving files from /tmp
    }
  },
  plugins: [tailwindcss({
    content: ['./src/**/*.{html,js,svelte,ts}']
  }
  ), sveltekit()],
})
