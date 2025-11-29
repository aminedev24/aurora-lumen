// ==============================================================================
// File: frontend/vite.config.web.ts
// Description: Vite config for WEB DEPLOYMENT ONLY (not Electron)
// - Production build outputs to dist/chat/ for web hosting
// - Base path: /chat/ for deployment under domain.com/chat/
// - API endpoint: https://api.aurora-lumen.com (production API)
// - NO Electron compatibility needed (uses absolute paths)
// ==============================================================================

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development" || command === "serve";
  const isPreview = mode === "preview";

  return {
    root: path.resolve(__dirname),
    publicDir: "public",
    base: "/chat/",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    envPrefix: "VITE_",
    server: {
      port: 5173,
      watch: {
        usePolling: true,
        interval: 1000,
      },
      proxy: isDev
        ? {
            "/api": {
              target: "http://localhost:8000",
              changeOrigin: true,
            },
          }
        : undefined,
    },
    define: {
      "import.meta.env.VITE_API_BASE": JSON.stringify(
        env.VITE_API_BASE || (isDev || isPreview ? "/api" : "https://api.aurora-lumen.com")
      ),
    },
    esbuild: {
      drop: ["console", "debugger"],
    },
    build: {
      outDir: "dist/chat",
      assetsDir: "assets",
      copyPublicDir: false,
      emptyOutDir: true,
      sourcemap: false,
      target: "es2018",
      cssCodeSplit: true,
      manifest: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: path.resolve(__dirname, "index.html"),
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
  };
});
