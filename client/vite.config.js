/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the Manga English Lab client (React + ESM).
// The `test` block configures Vitest (frontend unit/component runner per the
// test strategy): jsdom environment, global test APIs, and a setup file that
// registers @testing-library/jest-dom matchers and cleans up between tests.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    css: false,
  },
});
