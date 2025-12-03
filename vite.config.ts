import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/serial-data-collector/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.VITE_APP_NAME": JSON.stringify("Serial Data Collector"),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify("1.0.0"),
  },
})
