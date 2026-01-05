# Proof-of-Concept Experiments — Theming in Angular Microfrontends

This document explicitly and unambiguously defines the technical experiments that make up the PoC. Its purpose is to avoid loose interpretations, cross-contamination between approaches, and conclusions based on subjective impressions.

Each experiment represents an independent architectural hypothesis, isolated in its own repository branch.

---

## General rules (apply to all experiments)

These rules are non-negotiable:

1. Each experiment lives on an independent branch derived from `main`.
2. In each branch, modify only what is strictly necessary to validate the hypothesis.
3. Do not introduce hacks, global overrides, or ad-hoc solutions.
4. Do not pursue perfect visual coherence.
5. Code exists to expose couplings, not to hide them.

If an experiment requires “tricks” to work, that fact is part of the result, not something to fix.

---

## Experiment 1 — Host-centralized theme

### Hypothesis under test

Centralizing the Angular Material theme in the host enables visual consistency without introducing significant structural coupling between the host and the microfrontends.

This experiment does not assume the hypothesis is correct; its goal is to stress it.

### Allowed changes relative to `main`

- The host:

  - Installs Angular Material.
  - Defines and compiles a complete Angular Material theme.
  - Publishes the theme CSS globally.

- The microfrontends:

  - Use Angular Material components.
  - Do not define any theme of their own.

### Explicitly prohibited changes

- Duplicating host styles in the MFs.
- Local overrides to patch styles.
- Using CSS variables as an informal “bridge.”
- Synchronizing Material versions out of convenience.

### Experiments to perform

1. Change the host theme primary color.
2. Update Angular Material in the host without touching the MFs.
3. Try to update Angular Material inside an MF independently.

### Required observations

Document explicitly:

- Which implicit dependencies appear between host and MFs.
- What breaks the build and why.
- Which changes force coordination between teams.
- Where the actual authority over design lives.

### Architectural failure signals

- An MF cannot render Material without the host CSS.
- Visual changes in the host break MFs without code changes.
- Versioning Material independently proves infeasible.

---

## Experiment 2 — Theme defined per microfrontend

### Hypothesis under test

Allowing each microfrontend to define its own Angular Material theme maximizes autonomy without introducing relevant technical conflicts.

### Allowed changes relative to `main`

- Each microfrontend:

  - Installs Angular Material.
  - Defines and compiles its own theme.

- The host:

  - Does not define Angular Material styles.
  - Does not publish any theming-related CSS.

### Explicitly prohibited changes

- Sharing Material CSS between MFs.
- Centralizing visual decisions in the host.
- Forcing artificial visual consistency.

### Experiments to perform

1. Use different Angular Material versions across MFs (if possible).
2. Modify one MF's theme without touching the other.
3. Introduce minimal global styles (body, typography) and observe conflicts.

### Required observations

- The real degree of build isolation.
- Conflicts from global styles.
- Impact on user experience (even if not a success criterion).

### Architectural failure signals

- Inevitable global collisions.
- Need for coordination to make local changes.

---

## Experiment 3 — Shared design tokens + local theme

### Hypothesis under test

Sharing versioned design tokens, while keeping local compilation of the Angular Material theme, provides visual consistency without sacrificing microfrontend autonomy.

### Allowed changes relative to `main`

- Introduce `packages/tokens` as the single source of design decisions.

- The microfrontends:

  - Import tokens.
  - Locally compile their Material theme using those tokens.

- The host:

  - Does not define or distribute themes.

### Explicitly prohibited changes

- Include Angular Material within `tokens`.
- Expose compiled CSS from `tokens`.
- Import tokens directly into the host for Material styles.

### Experiments to perform

1. Create an initial tokens version (v1).
2. Create an incompatible tokens version (v2).
3. Migrate MF-A to v2 while keeping MF-B on v1.

### Required observations

- Where coupling manifests.
- Whether the coupling is technical or contractual.
- Impact on independent versioning and deployment.

### Architectural failure signals

- MFs stop being buildable without synchronization.
- Tokens behave like a concealed shared library.

---

## Comparison and closing remarks

After completing the three experiments, produce a comparative analysis that explicitly answers:

- Which strategy introduces the most structural coupling.
- Which strategy shifts coupling toward explicit contracts.
- Which risks appear only in the mid- to long-term.

The PoC does not conclude a definitive solution, but rather a provisional recommendation conditioned by organizational and technical context.
