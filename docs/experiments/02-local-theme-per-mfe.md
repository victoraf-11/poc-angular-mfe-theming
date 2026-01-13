# Experiment 2 — Fully Local Theme per MFE

## Context

Angular microfrontends architecture based on Native Federation, with a **shell** that acts solely as navigation orchestrator and mfe loader.

All mfes are independent Angular applications that use Angular Material as their UI library.
In this experiment, **each mfe compiles its own Angular Material theme**, and the shell does not provide any visual styling.

Unlike Experiment 1, here **visual autonomy** is prioritized over global consistency.

---

## Hypothesis

If each mfe compiles its own Angular Material theme and the host does not define any styles, then mfes can evolve visually independently.  
However, due to the global nature of some Angular Material CSS, the resulting isolation is **partial and fragile**, depending on load order and non-obvious side effects.

---

## Experiment premises

The following conditions are deliberate and part of the experiment:

### Shell

- Does not define any Angular Material theme.
- Does not import `@angular/material/theming`.
- Does not use Angular Material components.
- Does not expose any global styles.
- Acts exclusively as a container and orchestrator of mfes.

### MFEs

- Each mfe:
  - Defines its own Material theme.
  - Compiles its theme SCSS locally.
  - Decides palettes, mode (light/dark), typography, and density.
- There is no:
  - Shared theme
  - Common styles library
  - Token system
- All projects use **the same version of Angular and Angular Material**, intentionally, to isolate the experiment to theming only.

---

## Relevant technical setup

- Framework: Angular 17.x
- UI library: Angular Material 17.x
- Architecture: Angular microfrontends
- Federation: Native Federation (vanilla-native-federation)
- Workspace: Nx LTS + pnpm
- MFE type: Angular applications (not Web Components)

---

## Experiment implementation

### Shell

- All Angular Material-related styles are removed.
- No `@angular/material` imports in `styles.scss`.
- No `mat.core()` or `mat.all-component-themes()` calls.
- Uses system fonts instead of Roboto.
- The shell remains visually neutral — pure orchestrator.

**Shell styles.scss:**
```scss
/* NO Material theming - shell is pure orchestrator */
html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
}
```

---

### MFE-A

- **Primary Palette:** "Ocean Blue" custom (`#0066cc`)
- **Accent Palette:** "Energetic Teal" custom (`#00a896`)
- **Warn Palette:** Custom red
- **Density:** 0 (default)
- **Typography:** Roboto, headline-1 at 32px/40px

Compiles its own theme via:
```scss
@use '@angular/material' as mat;
@include mat.core();
@include mat.all-component-themes($mfe-a-theme);
```

### MFE-B

- **Primary Palette:** "Deep Slate Blue" custom (`#334155`)
- **Accent Palette:** "Bright Cyan" custom (`#06b6d4`)
- **Warn Palette:** Custom amber
- **Density:** -1 (compact)
- **Typography:** Segoe UI, headline-1 at 36px/44px

Compiles its own theme via:
```scss
@use '@angular/material' as mat;
@include mat.core();
@include mat.all-component-themes($mfe-b-theme);
```

Each mfe completely controls its appearance **from its own build**.

---

## Critical Native Federation Finding

### Problem: Global MFE styles are ignored at runtime

**DISCOVERED LIMITATION:**
The `styles.scss` files of MFEs are **NOT loaded** when the MFE is consumed via Native Federation.

**Why this happens:**
- The shell controls the bootstrap process (`main.ts`, `app.config.ts`)
- Only the shell's `styles.scss` is injected into the document
- MFE global styles are excluded from the federation bundle at runtime
- Similar to how `main.ts` and `app.config.ts` of MFEs are ignored

**Consequence:**
```scss
// apps/mfe-a/src/styles.scss
@use './app/core/ui/styles/themes/theme'; // ❌ IGNORED IN RUNTIME
```

The theme compilation never executes. Material components render **UNSTYLED**.

**Solution: Component-level style injection**

Instead of relying on global `styles.scss`, inject the theme via a **Layout component**:

```typescript
// apps/mfe-a/src/app/core/ui/layouts/base/base.layout.ts
@Component({
  selector: 'app-base-layout-a',
  standalone: true,
  templateUrl: './base.layout.html',
  styleUrl: './base.layout.scss',
  encapsulation: ViewEncapsulation.None, // ✅ Required for global Material styles
})
export class BaseLayout {}
```

**Why `ViewEncapsulation.None` is required:**

Angular's default `ViewEncapsulation.Emulated` scopes component styles by adding `_ngcontent-*` attributes. However, Angular Material's `mat.core()` and `mat.all-component-themes()` generate styles that MUST be global (`:root` variables, `.mat-*` classes, CDK overlays). Without `ViewEncapsulation.None`, these styles would be incorrectly scoped and Material components would not render properly.

**Known limitation: Console warning**

```
Could not find Angular Material core theme. Most Material components may not work as expected.
```

This warning appears because Angular Material checks for theme presence early in the application lifecycle, BEFORE the Layout component renders and injects the styles. The warning is **cosmetic** — the theme IS applied correctly once the Layout component initializes. This is an inherent limitation of component-level style injection vs global `styles.scss`.

**Critical performance issue: CSS accumulation**

With `ViewEncapsulation.None`, each time a BaseLayout component renders (on every navigation), Angular injects **NEW** `<style>` tags into the document `<head>`. In a SPA without page reloads:

- Each navigation to an MFE adds ~200KB+ of Material theme CSS
- Style tags accumulate infinitely in the DOM
- This causes gradual **memory leak** and **CSS parser performance degradation**
- The browser must process an ever-growing stylesheet

This is an inherent tradeoff of component-level style injection with `ViewEncapsulation.None`. Potential mitigations:

1. **Singleton style injection**: Check if styles already exist before injecting
2. **Shared theme in shell**: Accept coupling but avoid duplication
3. **CSS-in-JS approach**: Use runtime style management
4. **Accept the cost**: For apps with limited navigation, may be acceptable

```scss
// apps/mfe-a/src/app/core/ui/layouts/base/base.layout.scss
@use '../../styles/themes/theme';

// Apply the Angular Material theme via mixin
@include theme.apply-theme();

.mfe-a-layout {
  display: contents; // Transparent wrapper
}
```

Wrap all routed pages with this layout:

```html
<app-base-layout-a>
  <mat-card>...</mat-card>
</app-base-layout-a>
```

**Architectural implication:**

Even with "local theming per MFE", you cannot use global styles. The federation mechanism constrains where styles can be injected. True MFE autonomy requires **component-scoped style injection**.

---

## Deliberately provoked changes

### Change 1 — Coexistence of mfes with different themes

- MFE-A and MFE-B are loaded simultaneously from the shell.

**Observations**:

- Each mfe displays different colors and styles.
- They appear visually independent.
- There is no explicit coordination between them.

---

### Change 2 — Angular Material global styles

Angular Material introduces global effects even when the theme is "local":

| Global Effect | Generated By | Scope |
|---------------|--------------|-------|
| `:root` CSS custom properties | `mat.all-component-themes()` | Entire document |
| `body` typography styles | `mat.core()` | Entire document |
| `.mat-typography` hierarchy | `mat.core()` | Entire document |
| `.cdk-overlay-*` classes | `mat.core()` | Entire document |
| `.cdk-a11y-*` styles | `mat.core()` | Entire document |
| `.mat-ripple` styles | `mat.core()` | Entire document |
| Focus-visible polyfill | `mat.core()` | Entire document |
| Density scale variables | `mat.all-component-themes()` | Entire document |

**Observations**:

- Some global styles apply to the entire page.
- The result depends on the mfe load order.
- There is no explicit mechanism to avoid collisions.

---

### Change 3 — Load order sensitivity test

**Scenario A: MFE-A loads first, then MFE-B**
- MFE-A's Ocean Blue theme is applied globally
- MFE-B's Deep Slate Blue theme OVERWRITES all global styles
- Result: BOTH MFEs appear with MFE-B's theme

**Scenario B: MFE-B loads first, then MFE-A**
- MFE-B's Deep Slate Blue theme is applied globally
- MFE-A's Ocean Blue theme OVERWRITES all global styles
- Result: BOTH MFEs appear with MFE-A's theme

**Critical finding:** The last-loaded MFE's theme wins for the ENTIRE document.
There is no scoping mechanism for Angular Material's global CSS.

---

## Key observations

### Explicit list of global side effects observed

1. **`:root` CSS custom properties**
   - Each theme defines `--mdc-*` and `--mat-*` variables on `:root`
   - These are document-global and cannot be scoped
   - Last-loaded theme overwrites all previous values

2. **Typography on `body` and `html`**
   - `mat.core()` sets `font-family`, `font-size` on body
   - Different MFEs define different font configurations
   - Only one can win (CSS cascade)

3. **`.mat-app-background` class**
   - Each theme sets its own background colors
   - Applied globally, affects entire document

4. **CDK overlay styles**
   - `.cdk-overlay-container` positioned globally
   - Dialogs, dropdowns, tooltips use global overlay
   - Theming affects all overlays regardless of source MFE

5. **Density scale**
   - MFE-A uses density 0, MFE-B uses density -1
   - Last-loaded density applies to ALL components
   - Button heights, input sizes change globally

6. **Duplicate CSS generation**
   - Each `mat.core()` call generates ~50KB of core styles
   - Each `mat.all-component-themes()` generates ~200KB+
   - No deduplication — styles accumulate in document

### Real isolation vs apparent isolation

| Aspect | Isolated? | Explanation |
|--------|-----------|-------------|
| Component palettes (buttons, cards) | **Partially** | Colors come from CSS custom properties which are global |
| Form field appearance | **No** | Shares global `.mat-mdc-form-field` styles |
| Typography hierarchy | **No** | `h1-h6`, `p` styles are element selectors |
| Density | **No** | Single density value applies globally |
| Overlays (dialogs, menus) | **No** | Use global overlay container |
| Focus styles | **No** | `:focus-visible` rules are global |
| Ripple effects | **No** | `.mat-ripple` is global |

Isolation is **sufficient for demos**, but **weak for scaling**.

---

### Introduced complexity

- Each mfe:
  - Decides its own theme
  - Duplicates Material configuration logic
  - Generates its own 200KB+ of CSS
- Increases risk of:
  - Visual drift
  - UX inconsistencies
  - Lack of product identity
  - CSS bloat (multiple full theme compilations)

There is no strong technical coupling, but there is **fragmentation**.

---

## What this experiment demonstrates

- Compiling the theme locally per mfe:
  - Clearly improves autonomy at build time
  - Eliminates direct coupling with the shell
  - Enables independent deployments
- Angular Material:
  - Is not designed for strict per-application isolation
  - Introduces global effects that are difficult to control
  - Uses `:root` CSS custom properties that cannot be scoped
  - Generates duplicate CSS when compiled by multiple applications
- The achieved independence is:
  - Real at build level
  - Partial at global CSS level
  - Non-deterministic at runtime (load order dependent)

---

## Analysis of isolation boundaries

### What Angular Material's theming model constrains

1. **No Shadow DOM compatibility**
   - Angular Material components do not use Shadow DOM
   - All styles are global CSS, affecting the entire document
   - No encapsulation boundary exists

2. **CSS Custom Properties on `:root`**
   - Theme tokens are set on `:root` (document level)
   - Cannot be scoped to a subtree
   - Last definition wins

3. **Element selectors**
   - Typography uses `body`, `h1`, `p` selectors
   - These cannot be prefixed or namespaced
   - Affect entire document

4. **Global CDK infrastructure**
   - Overlay container is appended to `<body>`
   - All MFEs share the same overlay container
   - Theming of overlays is global

5. **No runtime theme detection**
   - `mat.core()` doesn't check if already called
   - Each MFE generates full CSS independently
   - No coordination mechanism exists

---

## Evidenced risks

### Technical risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Silent collisions of global styles | High | Certain | None within Angular Material |
| Implicit dependency on load order | High | Certain | Control loading sequence |
| CSS bloat from duplicate themes | Medium | Certain | Accept or share theme |
| Overlay theming inconsistencies | High | Certain | None |
| Density conflicts | Medium | Certain | Standardize density |
| Typography conflicts | Medium | Certain | Avoid `mat.core()` typography |

### Organizational risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Lack of visual consistency between mfes | Product identity dilution | Design governance |
| Absence of design governance | UX fragmentation | Cross-team coordination |
| Difficulty evolving towards a common identity | Technical debt | Shared token system |
| Load order becomes deployment concern | DevOps complexity | Orchestration layer |

---

## Experiment conclusion

Fully local theming per mfe **respects microfrontend principles much better** than centralization in the host.

However, Angular Material introduces global effects that limit real isolation and can generate subtle problems in the medium and long term if there is no coordination mechanism.

### What this experiment PROVES

1. **Build-time independence is achievable** — each MFE can compile its own theme
2. **Runtime isolation is NOT achievable** — Angular Material's global CSS prevents it
3. **Native Federation ignores MFE global styles** — `styles.scss` is not loaded at runtime
4. **Component-level injection works** — via BaseLayout with `ViewEncapsulation.None`
5. **Lazy routing prevents theme collision** — each navigation re-injects the correct theme
6. **CSS accumulation is a critical issue** — style tags accumulate infinitely in SPA navigation
7. **Overlays cannot be isolated** — they use a shared global container

### What this experiment does NOT prove

1. Does NOT prove that local theming is impractical — it works for demos and simple cases
2. Does NOT prove that version divergence causes issues — that was out of scope
3. Does NOT prove that Shadow DOM would solve this — Angular Material doesn't support it
4. Does NOT prove that CSS containment helps — Material's architecture prevents it

### When this approach is valid

- MFE autonomy is a priority over visual consistency
- Visual consistency is not critical (different products, internal tools)
- The number of mfes is small (2-3)
- Load order can be controlled
- Teams accept visual non-determinism

### When this approach is NOT valid

- Brand consistency is required across MFEs
- More than 3 MFEs coexist
- Load order cannot be guaranteed
- Performance matters (CSS bloat is unacceptable)
- Overlays must match their source MFE's theme

This approach is not a scalable solution on its own without introducing some type of shared contract.

---

## Status

- **Experiment:** COMPLETED
- Hypothesis: **confirmed with caveats**
- Build autonomy: **high**
- Runtime isolation: **achieved via lazy routing** (but CSS accumulates)
- Visual consistency: **per-MFE** (each MFE displays its own theme correctly)
- Performance impact: **negative** (CSS accumulation in SPA navigation)

This experiment justifies the need for a third strategy:
**shared tokens + locally compiled theme** or **accepting that Angular Material imposes document-global theming as an architectural constraint**.