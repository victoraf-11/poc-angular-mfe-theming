# Design Tokens

Shared design tokens library built with [Style Dictionary v5](https://styledictionary.com/).

This library serves as the **single source of truth** for design decisions across all microfrontends in the workspace. It produces framework-agnostic outputs that can be consumed by Angular, React, or any web technology.

## Architecture

```
src/lib/
├── tokens/                    # Source token definitions (JSON)
│   ├── color/
│   │   ├── base.json          # Primitive color palette
│   │   └── semantic.json      # Semantic color assignments (references primitives)
│   ├── spacing/
│   │   └── scale.json         # Spacing scale (0-24)
│   ├── typography/
│   │   ├── font.json          # Font families, weights, line-heights
│   │   └── scale.json         # Font size scale (xs-6xl)
│   ├── elevation/
│   │   └── shadow.json        # Shadow/elevation levels
│   └── border/
│       └── radius.json        # Border radius scale
│
└── build/                     # Generated outputs (gitignored)
    ├── css/
    │   └── tokens.css         # CSS custom properties
    ├── scss/
    │   ├── _tokens.scss       # SCSS tokens
    │   └── _tokens-map.scss   # SCSS nested map
    ├── js/
    │   ├── tokens.js          # ES6 module exports
    │   ├── tokens.d.ts        # TypeScript declarations
    │   └── tokens-nested.js   # Nested object structure
    └── json/
        ├── tokens.json        # Flat JSON
        └── tokens-nested.json # Nested JSON
```

## Building

```bash
# Build tokens only
pnpm nx run design-tokens:build-tokens

# Full build (tokens + copy to dist)
pnpm nx run design-tokens:build

# Clean build artifacts
pnpm nx run design-tokens:clean
```

## Consumption Patterns

### 1. CSS Variables (Runtime)

Import the CSS tokens file in your application's main styles:

```scss
// In styles.scss or main entry point
@import '@org/design-tokens/css';
```

Or in `angular.json` / `project.json`:

```json
{
  "styles": [
    "node_modules/@org/design-tokens/css/tokens.css",
    "src/styles.scss"
  ]
}
```

Then use tokens in your CSS/SCSS:

```scss
.my-component {
  background: var(--ds-color-semantic-background-primary);
  padding: var(--ds-spacing-scale-4);
  border-radius: var(--ds-border-radius-md);
  font-family: var(--ds-typography-font-family-sans);
}
```

### 2. SCSS Variables (Compile-time)

For SCSS preprocessing and Angular Material theme integration:

```scss
// Import SCSS tokens
@use '@org/design-tokens/scss/tokens' as tokens;

.my-component {
  background: tokens.$ds-color-semantic-background-primary;
  padding: tokens.$ds-spacing-scale-4;
}
```

### 3. SCSS Token Map (Angular Material Theming)

For building Angular Material custom themes:

```scss
@use '@angular/material' as mat;
@use '@org/design-tokens/scss/map' as tokens;

// Access nested token values
$primary-color: map-get(tokens.$ds-tokens, 'color', 'semantic', 'primary', 'base');

// Or use the token references directly in Material theming
$my-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$azure-palette,  // You'd map tokens to Material palettes
  )
));
```

### 4. JavaScript/TypeScript (Runtime Logic)

For conditional logic, animations, or dynamic styling:

```typescript
// ES6 named imports (flat)
import { DsColorSemanticPrimaryBase, DsSpacingScale4 } from '@org/design-tokens/js';

// Use in component logic
const primaryColor = DsColorSemanticPrimaryBase; // '#3b82f6'

// Nested structure for programmatic access
import tokens from '@org/design-tokens/js/nested';

const spacing = tokens.spacing.scale['4']; // '1rem'
```

### 5. JSON (Build Tools / Scripts)

For custom build tooling or token inspection:

```javascript
import tokens from '@org/design-tokens/json';
import tokensNested from '@org/design-tokens/json/nested';

// Flat structure
console.log(tokens['ds-color-semantic-primary-base']); // '#3b82f6'

// Nested structure
console.log(tokensNested.color.semantic.primary.base); // '#3b82f6'
```

## Token Naming Convention

Tokens follow a hierarchical naming pattern:

```
{prefix}-{category}-{subcategory}-{variant}-{state}
```

Examples:
- `ds-color-base-blue-500` - Base blue color at 500 weight
- `ds-color-semantic-primary-base` - Semantic primary color
- `ds-spacing-scale-4` - Spacing scale value 4
- `ds-typography-font-size-lg` - Large font size
- `ds-border-radius-md` - Medium border radius

The `ds` prefix stands for "design system" and prevents collisions with other CSS tokens.

## Token Categories

### Color

| Category | Purpose | Example |
|----------|---------|---------|
| `color.base.*` | Primitive palette | `color.base.blue.500` |
| `color.semantic.*` | Semantic assignments | `color.semantic.primary.base` |

**Semantic color tokens reference base tokens**, ensuring consistency:

```json
{
  "color": {
    "semantic": {
      "primary": {
        "base": { "value": "{color.base.blue.500}" }
      }
    }
  }
}
```

### Spacing

Linear scale from 0-24, where each step = 0.25rem:

| Token | Value |
|-------|-------|
| `spacing.scale.0` | `0` |
| `spacing.scale.1` | `0.25rem` |
| `spacing.scale.4` | `1rem` |
| `spacing.scale.8` | `2rem` |

### Typography

| Category | Tokens |
|----------|--------|
| `typography.font.family` | `sans`, `mono` |
| `typography.font.weight` | `regular`, `medium`, `semibold`, `bold` |
| `typography.font.size` | `xs` through `6xl` |
| `typography.font.lineHeight` | `none`, `tight`, `snug`, `normal`, `relaxed`, `loose` |
| `typography.font.letterSpacing` | `tighter`, `tight`, `normal`, `wide`, `wider` |

### Elevation

Shadow levels for depth indication:

| Token | Use Case |
|-------|----------|
| `elevation.shadow.none` | No shadow |
| `elevation.shadow.1` | Subtle elevation (cards) |
| `elevation.shadow.2` | Medium elevation (dropdowns) |
| `elevation.shadow.3` | High elevation (modals) |
| `elevation.shadow.4` | Highest elevation (tooltips) |

### Border

| Category | Tokens |
|----------|--------|
| `border.radius` | `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `full` |

## Extending Tokens

To add new tokens:

1. Add JSON definition in `tokens/` directory
2. Run `pnpm nx run design-tokens:build-tokens`
3. Verify outputs in `build/` directory
4. Run full build: `pnpm nx run design-tokens:build`

## Style Dictionary Configuration

See [style-dictionary.config.js](./style-dictionary.config.js) for the complete build configuration.

Key settings:
- **Prefix**: `ds` (design system)
- **Output References**: `true` (CSS tokens reference other tokens)
- **Transform Groups**: `css`, `scss`, `js` (built-in transforms)

## Output Reference Preservation

CSS output preserves token references:

```css
/* Generated CSS */
:root {
  --ds-color-base-blue-500: #3b82f6;
  --ds-color-semantic-primary-base: var(--ds-color-base-blue-500);
}
```

This allows runtime theme switching by only changing base values.
