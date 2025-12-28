import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  base: "/", // untuk Vercel aman "/"
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        history: resolve(__dirname, "history.html"),
        insights: resolve(__dirname, "insights.html"),
        login: resolve(__dirname, "login.html"),
      },
    },
  },
  server: {
    port: 8081,
  },
});
