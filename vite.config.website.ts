// ==============================================================================
// File: frontend/vite.config.website.ts
// Description: Vite config for LANDING PAGE/WEBSITE deployment
// - Production build outputs to dist/website/ for web hosting under /website
// - Base path: /website/ for deployment at https://aurora-lumen.com/website/
// - API endpoint: https://api.aurora-lumen.com (production API)
// ==============================================================================

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development" || command === "serve";
  const isPreview = mode === "preview";
  const isBuild = command === "build";

  return {
    root: path.resolve(__dirname),
    publicDir: "public",
    // For GitHub Pages under aminedev24.github.io/aurora-lumen/website/
    base: "/",
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
      drop: isBuild ? ["console", "debugger"] : [],
    },
    build: {
      outDir: "dist/website",
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
