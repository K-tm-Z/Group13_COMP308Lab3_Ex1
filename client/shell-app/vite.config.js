import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  server: {
    port: 3000,
    strictPort: true,
  },
  plugins: [
    react(),
    federation({
      name: 'shellApp',
      remotes: {
        userApp: 'http://localhost:3001/assets/remoteEntry.js',
        productApp: 'http://localhost:3002/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        '@apollo/client': { singleton: true },
        graphql: { singleton: true },
      },
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
