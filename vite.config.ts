import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

// Default dev config so `vite` / `npm run dev:frontend` works with src/ structure.
// Use vite.config.web.ts or vite.config.website.ts for their specific base paths.
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development" || command === "serve";

  return {
    root: path.resolve(__dirname),
    publicDir: "public",
    // Deploy under https://aminedev24.github.io/aurora-lumen/
    base: "/aurora-lumen/",
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
        env.VITE_API_BASE || (isDev ? "/api" : "https://api.aurora-lumen.com")
      ),
    },
    build: {
      outDir: "dist/default",
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
