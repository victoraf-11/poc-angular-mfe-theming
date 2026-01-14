# Experimentos de Theming

Este documento actúa como índice y marco común de los experimentos de la PoC. **Cada experimento tendrá su propio documento dedicado**, donde se recogerán hipótesis, premisas, pasos, observaciones y conclusiones.

La intención explícita es que estos documentos puedan reutilizarse como:

* Evidence log de la PoC
* Base para un ADR
* Soporte para discusiones arquitectónicas (internas o con la comunidad)

---

## Convención documental

Cada experimento contará con un documento independiente con la siguiente estructura mínima:

1. Contexto
2. Hipótesis
3. Premisas y restricciones
4. Setup técnico relevante
5. Cambios provocados deliberadamente
6. Observaciones (build / runtime / arquitectura)
7. Qué se demuestra
8. Riesgos evidenciados
9. Conclusiones

---

## Experimentos planificados

### Experimento 1 — Theme centralizado en el host

* **Documento**: [01-theme-centralized-in-host-esp.md](01-theme-centralized-in-host-esp.md)
* **Objetivo**: evidenciar acoplamiento implícito y pérdida de autonomía

### Experimento 2 — Theme completamente local por MFE

* **Documento**: [02-local-theme-per-mfe-esp.md](02-local-theme-per-mfe-esp.md)
* **Objetivo**: validar aislamiento real y coexistencia

### Experimento 3 — Tokens compartidos + theme local (✅ RECOMENDADO)

* **Documento**: [03-shared-design-tokens-with-local-themes-esp.md](03-shared-design-tokens-with-local-themes-esp.md)
* **Objetivo**: evaluar equilibrio entre consistencia y autonomía
* **Resultado**: ✅ **Arquitectura production-ready** - combina autonomía real de MFEs con consistencia visual garantizada mediante design tokens compartidos compilados a CSS variables
