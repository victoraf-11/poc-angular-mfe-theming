# Experiment 1 — Theme Centralized in the Host

## Context

Angular microfrontends architecture based on Native Federation, with a **shell** that orchestrates the loading of several independent Angular **mfes**.

All mfes use Angular Material as their UI library. The shell acts as the single entry point for the end user.

This experiment analyzes the architectural impact of **centralizing the Angular Material theme in the host**, while mfes consume Material components without compiling their own theme.

---

## Hypothesis

If the host defines and compiles the Angular Material theme and mfes do not compile their own, then the mfes become **implicitly coupled to the host** and lose **independence in build, versioning and evolution**, even though the UI may work at runtime.

---

## Experiment premises

The following conditions are deliberate and part of the experiment:

- Mfes **do not define** any Angular Material theme.
- Mfes **do not import** `@angular/material/theming`.
- The shell:
  - Defines the Material theme.
  - Compiles the theme using SCSS.
  - Exposes the compiled theme CSS globally.
- Not evaluated in this experiment:
  - Visual quality
  - Design consistency
  - User experience
- The goal is to **detect coupling**, not to "make it look perfect".

---

## Technical setup

- Framework: Angular 17.x
- UI library: Angular Material 17.x
- Architecture: Angular microfrontends
- Federation: Native Federation (orchestrated with `vanilla-native-federation`)
- Workspace: Nx LTS + pnpm
- MFE type: Angular applications (not Web Components)

---

## Experiment implementation

### Shell (`apps/shell/src/styles.scss`)

The shell defines and compiles the complete Angular Material theme:

```scss
@use '@angular/material' as mat;

@include mat.core();

$shell-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);
$shell-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);
$shell-warn: mat.m2-define-palette(mat.$m2-red-palette);

$shell-theme: mat.m2-define-light-theme((
  color: (
    primary: $shell-primary,
    accent: $shell-accent,
    warn: $shell-warn,
  ),
  typography: mat.m2-define-typography-config(...),
  density: 0,
));

@include mat.all-component-themes($shell-theme);
```

The shell **assumes full authority** over the visual appearance of the application.

---

### MFEs (`apps/mfe-a`, `apps/mfe-b`)

MFE styles explicitly document the intentional fragility:

```scss
/**
 * This microfrontend does NOT define any Angular Material theme.
 * It ASSUMES the host (shell) will provide the theme at runtime.
 *
 * CONSEQUENCES:
 * 1. Running mfe-a standalone will show UNSTYLED Material components
 * 2. mfe-a cannot be tested in isolation with correct theming
 * 3. mfe-a is IMPLICITLY COUPLED to whatever theme the host defines
 */

/* Minimal styles - NO Material theme compilation */
```

MFE components use Material modules directly without theme access:

```typescript
@Component({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    // etc.
  ],
})
export class RootPage {
  // Component uses Material components but has NO access to theme variables
}
```

---

## Deliberate changes and observations

### Change 1 — Modifying the host theme

- The shell's primary palette is changed.
- No changes are made to any mfe.

**Observed result**:

- All mfes change visually without modifying their code or version.

---

## Observations

### Implicit dependencies detected

Mfes implicitly depend on the host for:

- Color palettes
- Typography
- Density settings
- Global CSS variables
- Stylesheet load order
- Exact compatibility between Angular Material versions
- **Runtime providers** (see below)

These dependencies **are not declared**, **not versioned**, and **not governed**.

---

### Runtime provider coupling

A critical and often overlooked coupling occurs with Angular providers. When MFEs use Angular Material components that require specific providers (e.g., `provideAnimations()` for `MatFormField`), the **host must declare these providers**, not the MFE.

This happens because:

1. MFEs execute within the shell's injector context at runtime
2. The shell's `app.config.ts` is the actual provider source
3. MFE's own `app.config.ts` is only used when running standalone

**Consequences:**

- The shell must have **knowledge of MFE requirements** to function correctly
- MFEs **must document their provider dependencies** explicitly
- If the shell doesn't declare a required provider, MFEs break at runtime with no build-time warning
- The shell declares providers it doesn't need for its own code

```typescript
// shell/app.config.ts
return {
  providers: [
    provideRouter(appRoutes(federations)),
    // Shell doesn't need this, but MFEs do
    provideAnimations(),
  ],
};
```

This is not inherently bad, but it creates:
- **Inverted dependency**: host depends on knowing what MFEs need
- **Documentation burden**: MFEs must clearly specify runtime requirements
- **Runtime fragility**: no compile-time validation of provider availability

---

### Impact on mfe autonomy

- An mfe cannot:
  - Evolve its visual identity independently
  - Test theme changes without modifying the host
  - Version its visual identity separately
- The mfe becomes tied to the shell's change cycle.

---

## What this experiment demonstrates

- Centralizing the theme in the host:
  - Works technically
  - Violates core microfrontend principles
- The introduced coupling:
  - Is implicit
  - Is not visible in the mfe code
  - Cannot be tracked via versioning
- The short-term visual consistency is achieved at the cost of:
  - Autonomy
  - Independent evolution
  - Organizational scalability

---

## Evidenced risks

### Technical risks

- Version conflicts between Angular Material and compiled CSS
- Fragility to seemingly "visual-only" changes
- Harder styling-related debugging

### Organizational risks

- The shell becomes the de facto design authority
- MFE teams lose visual ownership
- Each visual change requires centralized coordination

---

## Conclusion

Centralizing the Angular Material theme in the host **is not neutral**.

Although it provides a consistent look in the short term, it introduces a level of coupling that:

- Is not explicit
- Is not versionable
- Does not scale well across multiple teams and mfes

In contexts where high autonomy is expected, this strategy should be considered **high-risk**.

---

## Status

- Hypothesis: **confirmed**
- Recommended use: **only in contexts with low autonomy requirements**
- Needs comparison with:
  - Experiment 2 — Local theme per mfe
  - Experiment 3 — Shared design tokens + local theme
