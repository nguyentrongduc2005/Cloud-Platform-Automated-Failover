/* eslint-env node */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(".", "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080", // BE của bạn
        changeOrigin: true,
        // không rewrite vì backend đã có context-path /api
        // /api/auth/register -> http://localhost:8080/api/auth/register
      },
    },
  },
});

/* eslint-env node */
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";
// import tailwindcss from "@tailwindcss/vite";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: {
//       "@": path.resolve(".", "./src"),
//     },
//   },
//   server: {
//     // --- THÊM DÒNG NÀY ĐỂ SỬA LỖI TUNNEL ---
//     allowedHosts: true,
//     // ---------------------------------------

//     port: 5173,
//     proxy: {
//       "/api": {
//         target: "http://localhost:8080", // BE của bạn
//         changeOrigin: true,
//         // không rewrite vì backend đã có context-path /api
//         // /api/auth/register -> http://localhost:8080/api/auth/register
//       },
//     },
//   },
// });
