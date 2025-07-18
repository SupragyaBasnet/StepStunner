import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            // Disable caching for all API responses
            proxyRes.headers["Cache-Control"] =
              "no-store, no-cache, must-revalidate, proxy-revalidate";
            proxyRes.headers["Pragma"] = "no-cache";
            proxyRes.headers["Expires"] = "0";
          });
        },
      },
    },
  },
});
