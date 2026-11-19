import { fileURLToPath } from 'node:url';
import { createVitestConfig } from '@lynx-js/react/testing-library/vitest-config';
import { defineConfig, mergeConfig } from 'vitest/config';

const backgroundOnly = fileURLToPath(
  new URL('./src/background-only-stub.ts', import.meta.url),
);

export default defineConfig(async () => {
  const lynx = await createVitestConfig();
  const setupFiles = lynx.test?.setupFiles ?? [];
  const files = Array.isArray(setupFiles) ? setupFiles : [setupFiles];
  return mergeConfig(lynx, {
    // Rspeedy replaces this at build time. Vitest does not read lynx.config.ts.
    define: {
      __API_BASE__: JSON.stringify(
        process.env.API_BASE ?? 'http://127.0.0.1:3001',
      ),
    },
    // Published Lynx packages ship sourcemaps whose sources are not in the
    // tarball. Inlining them makes Vite warn once per file.
    logLevel: 'error',
    test: {
      setupFiles: [...files, './src/__tests__/setup.ts'],
      // The 0.116 jsx runtime imports the bare specifier `preact` from inside
      // Bun's package store. Node never walks back to the app link, so Vite
      // has to transform that package and apply the preact alias.
      server: {
        deps: {
          inline: true,
        },
      },
    },
    resolve: {
      alias: {
        'background-only': backgroundOnly,
      },
    },
  });
});
