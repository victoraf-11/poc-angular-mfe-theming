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

### Shell

- Defines a complete Material theme (`primary`, `accent`, `warn`, typography).
- Compiles the theme using SCSS (`mat.define-theme`, `mat.all-component-themes`).
- Includes the compiled theme CSS as global styles.

The shell **assumes full authority** over the visual appearance of the application.

---

### MFEs

- Install Angular Material.
- Use Material components (`mat-toolbar`, `mat-button`, etc.).
- Do not define any local theme.
- Implicitly assume the required CSS will be present at runtime.

---

## Deliberate changes and observations

### Change 1 — Modifying the host theme

- The shell's primary palette is changed.
- No changes are made to any mfe.

**Observed result**:

- All mfes change visually without modifying their code or version.

---

### Change 2 — Different Angular Material version in an mfe

- An mfe updates Angular Material to a different version while the shell keeps its original version.

**Observed results** (case-dependent):

- Build or runtime errors.
- Visual inconsistencies.
- Difficulty determining the root cause (shell or mfe?).

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

These dependencies **are not declared**, **not versioned**, and **not governed**.

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
