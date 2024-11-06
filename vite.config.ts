import { resolve } from "path";
import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  return {
    build: {
      entry: resolve(__dirname, 'src/index.tsx'),
    },
    plugins: [
      react()
    ],
    server: {
      port: 3000
    }
  };
});
