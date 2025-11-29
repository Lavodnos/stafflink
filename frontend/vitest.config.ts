import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tailwind from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [react(), tailwind(), svgr()],
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
