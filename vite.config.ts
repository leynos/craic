import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
