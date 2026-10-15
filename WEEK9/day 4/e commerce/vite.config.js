import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The required folder structure uses .js files that contain JSX,
// so Vite is told to treat .js files under src/ as JSX.
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
});
