import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    checker({ typescript: true }),
    basicSsl(),
  ],
  server: {
    host: true,
    port: 5173,
    https: true,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
