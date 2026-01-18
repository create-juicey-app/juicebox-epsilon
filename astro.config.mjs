// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

import sentry from '@sentry/astro';
import spotlightjs from '@spotlightjs/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), sentry(), spotlightjs()],
  server: {
    allowedHosts: ['epsilon.juicey.dev'],
  }

});