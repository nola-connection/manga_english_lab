import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the Manga English Lab client (React + ESM).
export default defineConfig({
  plugins: [react()],
});
