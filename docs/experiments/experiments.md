# Theming Experiments

This document serves as an index and common framework for the PoC experiments. Each experiment will have its own dedicated document where hypotheses, premises, steps, observations and conclusions are recorded.

These documents are explicitly intended to be reusable as:

- The PoC evidence log
- A basis for an ADR
- Support for architectural discussions (internal or with the community)

---

## Documentation convention

Each experiment will have an independent document with the following minimum structure:

1. Context
2. Hypothesis
3. Premises and constraints
4. Relevant technical setup
5. Deliberate changes applied
6. Observations (build / runtime / architecture)
7. What the experiment demonstrates
8. Evidenced risks
9. Conclusions

---

## Planned experiments

### Experiment 1 — Host-centralized theme

* **Document**: [01-theme-centralized-in-host.md](01-theme-centralized-in-host.md)
* **Goal**: demonstrate implicit coupling and loss of autonomy

### Experiment 2 — Local theme per MFE

* **Document**: [02-local-theme-per-mfe.md](02-local-theme-per-mfe.md)
* **Goal**: validate true isolation and coexistence

### Experiment 3 — Shared tokens + local theme

* **Document**: [03-shared-design-tokens-with-local-themes.md](03-shared-design-tokens-with-local-themes.md)
* **Goal**: evaluate the balance between consistency and autonomy
