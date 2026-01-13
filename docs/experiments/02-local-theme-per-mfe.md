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
- No relevant global SCSS is loaded.
- The shell does not define any visual decisions.

The shell remains visually neutral.

---

### MFE-A

- Defines a local Material theme (light mode).
- Compiles its own theme SCSS.
- Uses Material components (`mat-toolbar`, `mat-button`, etc.).

### MFE-B

- Defines a different local Material theme (different palettes, dark mode).
- Compiles its own theme SCSS.
- Uses the same Material components as MFE-A.

Each mfe completely controls its appearance **from its own build**.

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

- `body`
- `html`
- Base typography (`mat-typography`)
- Density
- Focus styles
- Partial CSS reset

**Observations**:

- Some global styles apply to the entire page.
- The result depends on the mfe load order.
- There is no explicit mechanism to avoid collisions.

---

## Key observations

### Real isolation vs apparent isolation

- Isolated:
  - Component palettes
  - Local appearance of toolbars, buttons, inputs
- Not fully isolated:
  - Global typography
  - Density
  - Document base styles
  - Focus and accessibility

Isolation is **sufficient for demos**, but **weak for scaling**.

---

### Introduced complexity

- Each mfe:
  - Decides its own theme
  - Duplicates Material configuration logic
- Increases risk of:
  - Visual drift
  - UX inconsistencies
  - Lack of product identity

There is no strong technical coupling, but there is **fragmentation**.

---

## What this experiment demonstrates

- Compiling the theme locally per mfe:
  - Clearly improves autonomy
  - Eliminates direct coupling with the shell
- Angular Material:
  - Is not designed for strict per-application isolation
  - Introduces global effects that are difficult to control
- The achieved independence is:
  - Real at build level
  - Partial at global CSS level

---

## Evidenced risks

### Technical risks

- Silent collisions of global styles
- Implicit dependency on load order
- Difficulty guaranteeing visual determinism

### Organizational risks

- Lack of visual consistency between mfes
- Absence of design governance
- Difficulty evolving towards a common identity

---

## Experiment conclusion

Fully local theming per mfe **respects microfrontend principles much better** than centralization in the host.

However, Angular Material introduces global effects that limit real isolation and can generate subtle problems in the medium and long term if there is no coordination mechanism.

This approach is valid when:

- MFE autonomy is a priority
- Visual consistency is not critical
- The number of mfes is small

It is not a scalable solution on its own without introducing some type of shared contract.

---

## Status

- Hypothesis: **partially confirmed**
- Autonomy: **high**
- Visual consistency: **low**
- Real isolation: **incomplete**

This experiment justifies the need for a third strategy:
**shared tokens + locally compiled theme**.