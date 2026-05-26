import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://attendx-backend.onrender.com", // your Express backend
        changeOrigin: true,
      },
    },
  },
});
