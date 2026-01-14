import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        minify: 'esbuild',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                careers: resolve(__dirname, 'src/careers.html'),
                testimonials: resolve(__dirname, 'src/testimonials.html'),
                eb_privacy: resolve(__dirname, 'src/eb/privacy-policy.html'),
                mcc_privacy: resolve(__dirname, 'src/mcc/privacy-policy.html'),
            },
        },
    },
});
