import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, readFileSync } from 'fs';

// ═══ DEV: Serve landing page at / ═══
function serveLandingDev() {
  return {
    name: 'serve-landing-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];

        // Skip Vite internals and React app routes
        if (
          url.startsWith('/app') ||
          url.startsWith('/@') ||
          url.startsWith('/__') ||
          url.startsWith('/node_modules') ||
          url.startsWith('/src')
        ) {
          return next();
        }

        // Map URL to landing/ directory
        let filePath;
        if (url === '/' || url === '/index.html') {
          filePath = resolve(__dirname, 'landing/index.html');
        } else {
          filePath = resolve(__dirname, 'landing', url.slice(1));
        }

        // Serve file if it exists
        if (existsSync(filePath) && !statSync(filePath).isDirectory()) {
          const ext = filePath.split('.').pop().toLowerCase();
          const mimeTypes = {
            html: 'text/html; charset=utf-8',
            css: 'text/css; charset=utf-8',
            js: 'application/javascript; charset=utf-8',
            png: 'image/png',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            svg: 'image/svg+xml',
            webp: 'image/webp',
            ico: 'image/x-icon',
          };
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          res.end(readFileSync(filePath));
          return;
        }

        next();
      });
    },
  };
}

// ═══ BUILD: Copy landing page to dist/ root + React app to dist/app/ ═══
function copyLandingPlugin() {
  return {
    name: 'copy-landing',
    closeBundle() {
      const srcDir = resolve(__dirname, 'landing');
      const destDir = resolve(__dirname, 'dist');
      const appDir = resolve(destDir, 'app');

      function copyDir(src, dest) {
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        const entries = readdirSync(src);
        for (const entry of entries) {
          const srcPath = resolve(src, entry);
          const destPath = resolve(dest, entry);
          if (statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            copyFileSync(srcPath, destPath);
          }
        }
      }

      // 1. Move React build output into dist/app/
      if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });

      // Move index.html → app/index.html
      const reactHtml = resolve(destDir, 'index.html');
      if (existsSync(reactHtml)) {
        copyFileSync(reactHtml, resolve(appDir, 'index.html'));
      }

      // Move assets/ → app/assets/
      const assetsDir = resolve(destDir, 'assets');
      const appAssetsDir = resolve(appDir, 'assets');
      if (existsSync(assetsDir)) {
        copyDir(assetsDir, appAssetsDir);
      }

      // Move SW files → app/
      const swFiles = ['sw.js', 'workbox-dcde9eb3.js', 'registerSW.js', 'manifest.webmanifest'];
      for (const f of swFiles) {
        const src = resolve(destDir, f);
        if (existsSync(src)) {
          copyFileSync(src, resolve(appDir, f));
        }
      }

      // Move favicon
      const favicon = resolve(destDir, 'favicon.svg');
      if (existsSync(favicon)) {
        copyFileSync(favicon, resolve(appDir, 'favicon.svg'));
      }

      // 2. Overwrite dist root with landing page
      copyDir(srcDir, destDir);
      console.log('✓ Landing page → dist/');
      console.log('✓ React app → dist/app/');
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build';

  return {
    plugins: [
      // Dev: serve landing at /, Build: copy landing to dist/
      ...(isBuild ? [] : [serveLandingDev()]),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'BeatYesterday',
          short_name: 'BeatYesterday',
          description: 'Track bodyweight workouts, beat your PRs. Half an hour still counts.',
          theme_color: '#070707',
          background_color: '#070707',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/app',
          scope: '/app',
          icons: [
            {
              src: '/app/favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,woff,woff2}'],
          navigateFallback: '/app/index.html',
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /^https:\/\/api\.fontshare\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fontshare-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
      }),
      ...(isBuild ? [copyLandingPlugin()] : []),
    ],
    // Always /app — landing page is a separate static site at /
    base: '/app',
    build: {
      rollupOptions: {
        input: {
          app: resolve(__dirname, 'index.html'),
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      open: '/app',
    },
  };
});
