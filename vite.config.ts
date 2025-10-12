import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  // Compute base for production builds. Priority:
  // 1. GITHUB_PAGES_BASE (explicit)
  // 2. If GITHUB_PAGES=true, derive from GITHUB_REPOSITORY (owner/repo -> /repo/)
  // 3. Default '/'
  base:
    process.env.GITHUB_PAGES_BASE ||
    (process.env.GITHUB_PAGES === 'true'
      ? `/${(process.env.GITHUB_REPOSITORY || process.env.npm_package_name || '')
          .split('/')
          .pop()}/`
      : '/'),
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
