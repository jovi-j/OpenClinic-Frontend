import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Important for production build debugging
  },
  css: {
    devSourcemap: true, // Optional: helps debug CSS
  },
});
