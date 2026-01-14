/**
 * @org/design-tokens - TypeScript Entry Point
 *
 * Re-exports all design tokens from the Style Dictionary build.
 *
 * ⚠️  IMPORTANT: Tokens are auto-generated. If you see import errors, run:
 *
 *     pnpm nx run design-tokens:build-tokens
 *
 * This generates all outputs (CSS, SCSS, JS, JSON) in src/lib/build/
 * See README.md for detailed documentation.
 */

// Validate tokens are built before allowing imports
const checkTokensBuild = () => {
  try {
    // Attempt to import to verify build exists
    require('./lib/build/js/tokens');
  } catch (error) {
    console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  DESIGN TOKENS NOT BUILT                                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  The design tokens must be generated before use.               ║
║                                                                 ║
║  Run this command:                                             ║
║                                                                 ║
║    pnpm nx run design-tokens:build-tokens                      ║
║                                                                 ║
║  See libs/shared/design-tokens/README.md for more info.        ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
    `);
    throw new Error('Design tokens not built. Run: pnpm nx run design-tokens:build-tokens');
  }
};

// Run validation check
checkTokensBuild();

export * from './lib/build/js/tokens';
