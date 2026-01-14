# Experiment 3 — Shared Design Tokens + Local Themes

## Context

Angular microfrontends architecture based on Native Federation, with a **shell** acting as orchestrator and **MFEs** as independent applications that can function both in standalone mode and integrated.

This experiment seeks the optimal balance between:
- **Visual consistency** through shared design tokens
- **MFE autonomy** through locally compiled independent themes
- **Elimination of style duplication** at runtime

---

## Hypothesis

If design tokens are centralized in a shared library and each MFE compiles its own Angular Material theme consuming those tokens via CSS variables, then:

1. **MFEs are truly independent** - they can run standalone and display correctly
2. **No style duplication exists** - CSS tokens load only once (by shell in federated mode, by MFE in standalone mode)
3. **Visual consistency is maintained** - all MFEs use the same design values
4. **Themes are runtime-compatible** - they use CSS variables resolved at runtime, not compile-time

---

## Experiment premises

### Design Tokens Library

- Shared library: `@org/design-tokens`
- Technology: [Style Dictionary v5 LTS](https://styledictionary.com/)
- Location: `libs/shared/design-tokens`
- Package manager: pnpm workspace protocol (`workspace:*`)
- Generated outputs:
  - **CSS** (`tokens.css`) - For runtime consumption
  - **SCSS variables** (`_tokens.scss`) - For compile-time (NOT USED in this experiment)
  - **SCSS maps** (`_tokens-map.scss`) - For complex structures (NOT USED in this experiment)
  - **JavaScript/TypeScript** - For application logic (NOT USED in this experiment)
  - **JSON** - For tooling and documentation (NOT USED in this experiment)

### Shell

- **Loads CSS tokens globally** via `project.json` styles array
- Does not define Angular Material theme (doesn't use Material components)
- Consumes CSS tokens for its own styles (`var(--ds-color-*)`)
- Acts as container and orchestrator of MFEs

### MFEs

- **Each MFE includes CSS tokens in its `project.json` styles array**
- **Material themes are compiled using CSS variables** (not SCSS variables)
- MFEs are complete and functional Angular applications
- Work correctly both standalone and integrated

---

## Relevant technical setup

- Framework: Angular 17.3.0
- UI library: Angular Material 17.3.0
- Architecture: Angular Microfrontends
- Federation: Native Federation (@angular-architects/native-federation)
- Workspace: Nx 20.4.0 + pnpm 10.28.0
- Design System: Style Dictionary 5.1.4 LTS
- Package resolution: pnpm workspace protocol with symlinks

---

## Solution architecture

### 1. Design Tokens Library

**Structure:**
```
libs/shared/design-tokens/
├── src/
│   ├── lib/
│   │   ├── tokens/           # JSON sources (162 tokens)
│   │   │   ├── color/
│   │   │   │   ├── base.json        # Navy, Teal, Red, Neutral, VSCode, Pink
│   │   │   │   └── semantic.json    # primary, accent, warn, text, background
│   │   │   ├── spacing/
│   │   │   │   └── scale.json       # 0-24 scale (0px, 4px, 8px... 96px)
│   │   │   ├── typography/
│   │   │   │   ├── font.json        # families, weights
│   │   │   │   └── scale.json       # sizes (xs-6xl), line-heights, letter-spacing
│   │   │   ├── elevation/
│   │   │   │   └── shadow.json      # 0-4 levels
│   │   │   └── border/
│   │   │       └── radius.json      # sm, base, md, lg, xl, full
│   │   └── build/             # Generated outputs (gitignored)
│   │       ├── css/
│   │       │   └── tokens.css       # ← Used at runtime
│   │       ├── scss/
│   │       ├── js/
│   │       └── json/
│   └── index.ts               # Entry point with validation
├── style-dictionary.config.js
├── package.json               # name: "@org/design-tokens"
└── README.md
```

**Package resolution:**
```json
// package.json (root)
{
  "dependencies": {
    "@org/design-tokens": "workspace:*"
  }
}

// pnpm-workspace.yaml
{
  "packages": [
    "libs/shared/design-tokens"
  ]
}
```

This creates a symlink:
```bash
node_modules/@org/design-tokens → libs/shared/design-tokens
```

**Result:** `@org/design-tokens/*` imports work identically in dev and production.

---

### 2. Token consumption in Shell

**project.json:**
```json
{
  "targets": {
    "build-base": {
      "options": {
        "styles": [
          "node_modules/@org/design-tokens/src/lib/build/css/tokens.css",
          "apps/shell/src/styles.scss"
        ]
      }
    }
  }
}
```

**styles.scss:**
```scss
// Tokens already loaded globally via styles array
// Direct CSS variable consumption
.container {
  padding: var(--ds-spacing-6);
  background: var(--ds-color-background-default);
  color: var(--ds-color-text-primary);
}
```

**app.component.scss:**
```scss
.main-content {
  padding: var(--ds-spacing-4);
  background: linear-gradient(
    135deg,
    var(--ds-color-primary-dark) 0%,
    var(--ds-color-primary-default) 100%
  );
}
```

---

### 3. Token consumption in MFEs (KEY TO THE ARCHITECTURE)

#### project.json (MFE-A and MFE-B)

```json
{
  "targets": {
    "build-base": {
      "options": {
        "styles": [
          "node_modules/@org/design-tokens/src/lib/build/css/tokens.css",
          "apps/mfe-a/src/styles.scss"
        ]
      }
    }
  }
}
```

**Dual behavior:**
- **Standalone mode**: `tokens.css` is included in bundle → CSS variables available ✅
- **Native Federation mode**: styles array is ignored (shell already loaded tokens) → no duplication ✅

---

#### Material Theme with CSS Variables (_theme.scss)

**BEFORE (Experiment 2):**
```scss
@use '@org/design-tokens/scss/tokens' as tokens;

$primary-palette: (
  500: tokens.$ds-color-base-navy-500,  // ❌ Compile-time SCSS variable
  600: tokens.$ds-color-base-navy-600,
  // ...
);
```

**NOW (Experiment 3):**
```scss
// NO SCSS token imports - we use CSS variables

$primary-palette: (
  50: var(--ds-color-base-navy-50),   // ✅ Runtime CSS variable
  100: var(--ds-color-base-navy-100),
  200: var(--ds-color-base-navy-200),
  300: var(--ds-color-base-navy-300),
  400: var(--ds-color-base-navy-400),
  500: var(--ds-color-base-navy-500),
  600: var(--ds-color-base-navy-600),
  700: var(--ds-color-base-navy-700),
  800: var(--ds-color-base-navy-800),
  900: var(--ds-color-base-navy-900),
  contrast: (
    50: var(--ds-color-base-neutral-900),
    500: var(--ds-color-base-neutral-0),
    // ...
  ),
);

$mat-primary: mat.define-palette($primary-palette, 900, 500, 900);

$mfe-a-theme: mat.define-light-theme(
  (
    color: (
      primary: $mat-primary,
      accent: $mat-accent,
      warn: $mat-warn,
    ),
    typography: mat.define-typography-config(
      $font-family: var(--ds-font-family-sans),  // ✅ CSS variable
      $headline-1: mat.define-typography-level(
        var(--ds-font-size-4xl),                  // ✅ CSS variable
        var(--ds-font-line-height-tight),
        var(--ds-font-weight-bold)
      ),
      // ...
    ),
  )
);
```

**Advantages:**
1. MFEs have NO compile-time dependency on SCSS tokens
2. Tokens resolve at runtime from CSS variables
3. MFEs work standalone because their styles arrays load `tokens.css`
4. No duplication in NF mode because styles array is ignored

---

#### Theme application (base.layout.scss)

Due to Native Federation limitation where global `styles.scss` is ignored:

```scss
/**
 * MFE-A Base Layout Styles
 *
 * WHY HERE AND NOT IN styles.scss?
 * - Global styles.scss is ignored when MFE is loaded remotely
 * - Component styleUrls ARE processed and injected
 * - This is the ONLY way to ensure theme CSS is present at runtime
 */

@use '../../styles/themes/theme' as theme;

// Apply the Angular Material theme
@include theme.apply-theme();  // Generates mat.core() + mat.all-component-themes()

.mfe-a-layout {
  display: contents;
}
```

**Component:**
```typescript
@Component({
  selector: 'app-base-layout-a',
  styleUrl: './base.layout.scss',
  encapsulation: ViewEncapsulation.None, // ✅ Required for Material global theme
})
export class BaseLayoutComponent {}
```

---

## Key observations

### 1. Total elimination of hardcoded values

**Before the experiment:**
- ~200+ hardcoded colors (hex, rgba, hsla)
- ~150+ hardcoded spacing values (px, rem)
- ~50+ hardcoded font sizes and weights
- ~30+ hardcoded shadows and border-radius

**After the experiment:**
- ✅ **0 hardcoded values** in any stylesheet
- ✅ **100% token coverage** including `0` values (spacing-0)
- ✅ CSS code reduction: ~500 lines → ~300 lines in some components

**Conversion example:**
```scss
// BEFORE
.nav-menu {
  top: 0;
  padding: 4px 8px;
  background: #334155;
  font-size: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

// AFTER
.nav-menu {
  top: var(--ds-spacing-0);
  padding: var(--ds-spacing-1) var(--ds-spacing-2);
  background: var(--ds-color-base-neutral-700);
  font-size: var(--ds-font-size-xs);
  box-shadow: var(--ds-elevation-2);
}
```

---

### 2. Symlinks and path resolution

Using pnpm workspace protocol with symlinks is **CRITICAL**:

```bash
$ ls -la node_modules/@org/
lrwxr-xr-x  design-tokens -> ../../libs/shared/design-tokens
```

**Advantages:**
1. `@org/design-tokens` resolves the same in dev and prod
2. cmd+click works on imports (IDE navigation)
3. No configuration required in `tsconfig.base.json` paths
4. No `stylePreprocessorOptions` hacks

---

### 3. CSS vs SCSS tokens separation

**CSS tokens** (`tokens.css`):
- For runtime consumption
- Loaded globally via styles array
- Used in components with `var(--ds-*)`
- Used in Material themes with `var(--ds-*)`

**SCSS tokens** (`_tokens.scss`):
- Available but NOT USED in this experiment
- Could be used for complex mixins/functions
- In this experiment, we prefer CSS vars for runtime flexibility

**JavaScript/TypeScript tokens**:
- For application logic (e.g., dynamic configurations)
- For development tooling
- For automated documentation

---

### 4. Native Federation limitations

**What IS IGNORED in remote MFE:**
- Global `styles.scss`
- `main.ts`
- `app.config.ts`

**What IS PROCESSED:**
- Component `styleUrls`
- Component inline `styles`
- Assets referenced from components

**Solution:** Inject Material theme at component layout level with `ViewEncapsulation.None`

---

## Conclusions

### ✅ Hypothesis confirmed

The architecture of shared design tokens + local themes compiled with CSS variables **works perfectly** and solves all problems found in previous experiments:

1. **Truly independent MFEs** ✅
   - Work standalone without shell dependencies
   - All their styles display correctly
   - Can be developed and tested in isolation

2. **No style duplication** ✅
   - In NF mode: only shell loads tokens.css (styles array ignored in MFEs)
   - In standalone mode: each MFE loads its tokens.css
   - Optimized build size

3. **Guaranteed visual consistency** ✅
   - Single source of truth: 162 tokens defined in JSON
   - All projects use the same values
   - Token changes propagate automatically

4. **Runtime flexibility** ✅
   - CSS variables enable future dynamic theming
   - No recompilation required for theme changes
   - Compatible with dark mode and customizations

---

### Proposal trade-offs

#### Advantages

**1. "Technically honest" architecture**
- No path hacks or workarounds
- Dependencies are explicit and verifiable
- Behavior is predictable in dev and prod

**2. Superior developer experience**
- cmd+click works on all imports
- Clear errors if tokens aren't generated
- Hot reload works correctly

**3. Reduced maintenance**
- Color change → edit 1 JSON file
- Regenerate tokens → 1 command
- No manual find/replace across 50 files

**4. Proven scalability**
- Would work with 5, 10, or 50 MFEs
- New MFEs copy existing pattern
- No shared global state to manage

**5. Build performance**
- Tokens generated once, reused infinitely
- No SCSS recompilation in each MFE
- Parallel builds without blocking

---

#### Disadvantages

**1. Additional build step**
- Requires running `pnpm nx run design-tokens:build-tokens`
- If tokens are modified, outputs must be regenerated
- Solution: add to pre-commit hooks or CI

**2. CSS variables don't support all SCSS operations**
- Can't do `darken(var(--color), 10%)` directly
- Requires pre-calculating variations in Style Dictionary
- Trade-off: we prefer runtime flexibility over compile-time transformations

**3. Angular Material + CSS vars = unofficial solution**
- Material traditionally expects SCSS variables
- This solution works but isn't officially documented
- Risk mitigation: extensively documented in this experiment

**4. Initial learning curve**
- Developers must understand:
  - Style Dictionary as a tool
  - CSS vs SCSS token differences
  - Native Federation limitations
- Time investment but positive ROI

---

### Impact on current architecture

**This solution can make a fundamental difference in our architecture because:**

#### 1. Eliminates implicit coupling
- MFEs no longer depend on shell for basic styles
- Each team can develop their MFE autonomously
- Visual testing doesn't require bringing up the complete shell

#### 2. Scales naturally
- Adding a new MFE: copy existing pattern
- No global configuration to keep synchronized
- Multiple teams can work in parallel without conflicts

#### 3. Facilitates migrations
- An MFE can upgrade to Angular N+1 without affecting others
- We can migrate Material Design versions gradually

---

### Mitigated risks

| Risk | Implemented mitigation |
|------|----------------------|
| **Tokens not generated** | Validation in `index.ts` with clear message + command |
| **CSS vars not available** | Styles array ensures loading in both modes (standalone/NF) |
| **Drift between MFEs** | Single source of truth in JSON, automatic generation |
| **Breaking changes in tokens** | Package versioning, TypeScript types for validation |
| **Build performance** | Pre-generated tokens, not recompiled in each MFE build |

---

## Final conclusion

This experiment demonstrates it's possible to build an Angular microfrontends architecture with:
- **Real autonomy** of each MFE (can run standalone)
- **Guaranteed visual consistency** (shared design tokens)
- **Zero or minimal duplication** of styles (tokens load only once)
- **Superior maintainability** (single source of truth in JSON)
- **Excellent developer experience** (type safety, cmd+click, hot reload)

The combination of **Style Dictionary + pnpm workspace protocol + CSS variables in Material themes** solves fundamental problems found in previous architectures and establishes a scalable and maintainable pattern for the long term.

**This architecture is production-ready and recommended for Angular microfrontend projects requiring team autonomy while maintaining visual consistency.**
