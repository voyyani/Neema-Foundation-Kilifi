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
    https: {},
  },
  build: {
    rollupOptions: {
      output: {
        // Keep large, rarely-changing vendor code in stable chunks so an
        // application deploy does not invalidate the whole bundle.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
        },
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
});
