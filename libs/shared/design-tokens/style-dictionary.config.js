/**
 * Style Dictionary Configuration
 *
 * Generates design token outputs for:
 * - CSS custom properties
 * - SCSS variables and maps
 * - JavaScript/TypeScript modules
 */
import StyleDictionary from 'style-dictionary';

const SD_CONFIG = {
  source: ['src/lib/tokens/**/*.json'],
  platforms: {
    /**
     * CSS Variables
     * Output: src/lib/build/css/tokens.css
     * Usage: @import '@org/design-tokens/css';
     */
    css: {
      transformGroup: 'css',
      buildPath: 'src/lib/build/css/',
      prefix: 'ds',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },

    /**
     * SCSS Variables
     * Output: src/lib/build/scss/_variables.scss
     * Usage: @use '@org/design-tokens/scss' as tokens;
     */
    scss: {
      transformGroup: 'scss',
      buildPath: 'src/lib/build/scss/',
      prefix: 'ds',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },

    /**
     * SCSS Map (Deep nested)
     * Output: src/lib/build/scss/_tokens-map.scss
     * Useful for programmatic access in SCSS
     */
    'scss-map': {
      transformGroup: 'scss',
      buildPath: 'src/lib/build/scss/',
      prefix: 'ds',
      files: [
        {
          destination: '_tokens-map.scss',
          format: 'scss/map-deep',
          options: {
            mapName: 'design-tokens',
            outputReferences: true,
          },
        },
      ],
    },

    /**
     * JavaScript ES Modules
     * Output: src/lib/build/js/tokens.js
     * Usage: import { tokens } from '@org/design-tokens';
     */
    js: {
      transformGroup: 'js',
      buildPath: 'src/lib/build/js/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
      ],
    },

    /**
     * JavaScript ESM object (nested structure)
     * Output: src/lib/build/js/tokens-nested.js
     * Provides full token object with metadata
     */
    'js-nested': {
      transformGroup: 'js',
      buildPath: 'src/lib/build/js/',
      files: [
        {
          destination: 'tokens-nested.js',
          format: 'javascript/esm',
          options: {
            minify: true,
          },
        },
      ],
    },

    /**
     * TypeScript declarations
     * Output: src/lib/build/js/tokens.d.ts
     */
    ts: {
      transformGroup: 'js',
      buildPath: 'src/lib/build/js/',
      files: [
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },

    /**
     * JSON flat structure
     * Output: src/lib/build/json/tokens.json
     * Useful for tooling integration
     */
    json: {
      transformGroup: 'js',
      buildPath: 'src/lib/build/json/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/flat',
        },
      ],
    },

    /**
     * JSON nested structure
     * Output: src/lib/build/json/tokens-nested.json
     * Preserves token hierarchy
     */
    'json-nested': {
      transformGroup: 'js',
      buildPath: 'src/lib/build/json/',
      files: [
        {
          destination: 'tokens-nested.json',
          format: 'json/nested',
        },
      ],
    },
  },
};

const sd = new StyleDictionary(SD_CONFIG);

await sd.buildAllPlatforms();
