# Experimentos de la PoC — Theming en Microfrontends Angular

Este documento define **de forma explícita y no ambigua** los experimentos técnicos que componen la PoC. Su función es evitar interpretaciones libres, contaminación entre enfoques y conclusiones basadas en impresiones subjetivas.

Cada experimento representa **una hipótesis arquitectónica independiente**, aislada en su propia rama del repositorio.

---

## Reglas generales (aplican a todos los experimentos)

Estas reglas son **no negociables**:

1. Cada experimento vive en una rama independiente derivada de `main`.
2. En cada rama se modifica **únicamente** lo necesario para validar la hipótesis.
3. No se introducen hacks, overrides globales ni soluciones ad-hoc.
4. No se persigue coherencia visual perfecta.
5. El código existe para **evidenciar acoplamientos**, no para ocultarlos.

Si un experimento requiere “trucos” para funcionar, ese hecho **es parte del resultado**, no algo a corregir.

---

## Experimento 1 — Theme centralizado en el host

### Hipótesis evaluada

> Centralizar el theme de Angular Material en el host permite consistencia visual sin introducir acoplamiento estructural significativo entre host y microfrontends.

Este experimento **no asume que la hipótesis sea correcta**; su objetivo es tensionarla.

### Cambios permitidos respecto a `main`

* El host:

  * Instala Angular Material.
  * Define y compila un theme completo de Angular Material.
  * Publica el CSS del theme de forma global.

* Los microfrontends:

  * Usan componentes Angular Material.
  * **No** definen ningún theme propio.

### Cambios explícitamente prohibidos

* Duplicar estilos del host en los MF.
* Overrides locales para corregir estilos.
* Uso de variables CSS como “puente” informal.
* Sincronizar versiones de Material por conveniencia.

### Experimentos a provocar

1. Cambiar el color primario del theme en el host.
2. Actualizar Angular Material en el host sin tocar los MF.
3. Intentar actualizar Angular Material en un MF de forma independiente.

### Observaciones obligatorias

Se debe documentar explícitamente:

* Qué dependencias implícitas aparecen entre host y MF.
* Qué rompe el build y por qué.
* Qué cambios fuerzan coordinación entre equipos.
* Dónde reside realmente la autoridad del diseño.

### Señales de fallo arquitectónico

* El MF no puede renderizar Material sin el CSS del host.
* Cambios visuales del host rompen MF sin cambios de código.
* Versionar Material de forma independiente resulta inviable.

---

## Experimento 2 — Theme definido por cada microfrontend

### Hipótesis evaluada

> Permitir que cada microfrontend defina su propio theme de Angular Material maximiza la autonomía sin introducir conflictos técnicos relevantes.

### Cambios permitidos respecto a `main`

* Cada microfrontend:

  * Instala Angular Material.
  * Define y compila su propio theme.

* El host:

  * No define estilos de Angular Material.
  * No publica CSS relacionado con theming.

### Cambios explícitamente prohibidos

* Compartir CSS de Material entre MF.
* Centralizar decisiones visuales en el host.
* Forzar consistencia visual artificial.

### Experimentos a provocar

1. Usar distintas versiones de Angular Material entre MF (si es viable).
2. Modificar el theme de un MF sin tocar el otro.
3. Introducir estilos globales mínimos (body, typography) y observar conflictos.

### Observaciones obligatorias

* Grado real de aislamiento entre builds.
* Conflictos de estilos globales.
* Impacto en experiencia de usuario (aunque no sea criterio de éxito).

### Señales de fallo arquitectónico

* Colisiones globales inevitables.
* Necesidad de coordinación para cambios locales.

---

## Experimento 3 — Design tokens compartidos + theme local

### Hipótesis evaluada

> Compartir design tokens versionados, manteniendo la compilación local del theme de Angular Material, permite consistencia visual sin sacrificar la autonomía de los microfrontends.

### Cambios permitidos respecto a `main`

* Se introduce `packages/tokens` como fuente única de decisiones de diseño.

* Los microfrontends:

  * Importan tokens.
  * Compilan localmente su theme Material usando dichos tokens.

* El host:

  * No define ni distribuye themes.

### Cambios explícitamente prohibidos

* Incluir Angular Material dentro de `tokens`.
* Exponer CSS compilado desde `tokens`.
* Importar tokens directamente en el host para estilos Material.

### Experimentos a provocar

1. Crear una versión inicial de tokens (v1).
2. Crear una versión incompatible de tokens (v2).
3. Migrar MF-A a v2 manteniendo MF-B en v1.

### Observaciones obligatorias

* Dónde se manifiesta el acoplamiento.
* Si el acoplamiento es técnico o contractual.
* Impacto en versionado y despliegue independiente.

### Señales de fallo arquitectónico

* Los MF dejan de ser compilables sin sincronización.
* Los tokens actúan como una shared lib encubierta.

---

## Comparativa y cierre

Al finalizar los tres experimentos se debe elaborar un análisis comparativo que responda, de forma explícita:

* Qué estrategia introduce más acoplamiento estructural.
* Qué estrategia desplaza el acoplamiento hacia contratos explícitos.
* Qué riesgos aparecen solo a medio y largo plazo.

La PoC **no concluye una solución definitiva**, sino una **recomendación provisional condicionada al contexto organizativo y técnico**.
