# Experimento 1 — Theme centralizado en el host

## Contexto

Arquitectura de microfrontends Angular basada en Native Federation, con un **shell** que orquesta la carga de varios **mfes** Angular independientes.

Todos los mfes utilizan Angular Material como librería UI.  
El shell actúa como punto de entrada único para el usuario final.

Este experimento analiza el impacto arquitectónico de **centralizar el theme de Angular Material en el host**, mientras los mfes consumen componentes Material sin compilar su propio theme.

---

## Hipótesis

Si el host define y compila el theme de Angular Material y los mfes no compilan el suyo propio, entonces los mfes quedan **acoplados implícitamente al host** y pierden **independencia de build, versionado y evolución**, incluso aunque el código compile y la UI funcione correctamente.

---

## Premisas del experimento

Las siguientes condiciones **no son accidentales**, forman parte explícita del experimento:

- Los mfes **no definen** ningún theme de Angular Material.
- Los mfes **no importan** `@angular/material/theming`.
- El shell:
  - Define el theme Material.
  - Compila el CSS del theme.
  - Lo expone de forma global.
- No se evalúa:
  - Calidad visual
  - Consistencia de diseño
  - Experiencia de usuario
- El objetivo es **detectar acoplamientos**, no “hacer que funcione”.

---

## Setup técnico relevante

- Framework: Angular 17.x
- UI library: Angular Material 17.x
- Arquitectura: Microfrontends Angular
- Federación: Native Federation (orquestada con `vanilla-native-federation`)
- Workspace: Nx LTS + pnpm
- Tipo de mfes: Angular applications (no Web Components)

---

## Implementación del experimento

### Shell

- Define un theme Material completo (`primary`, `accent`, `warn`, typography).
- Compila el theme usando SCSS (`mat.define-theme`, `mat.all-component-themes`).
- Incluye el CSS del theme como estilos globales.

El shell **asume autoridad total** sobre el aspecto visual de la aplicación.

---

### MFEs

- Instalan Angular Material.
- Usan componentes Material (`mat-toolbar`, `mat-button`, etc.).
- No definen ningún theme local.
- Asumen implícitamente que el CSS necesario existe en runtime.

---

## Cambios provocados deliberadamente

### Cambio 1 — Modificación del theme en el host

- Se cambia la paleta principal del theme en el shell.
- No se modifica ningún mfe.

**Resultado observado**:

- Todos los mfes cambian visualmente.
- Ningún mfe ha cambiado código ni versión.

---

### Cambio 2 — Versión distinta de Angular Material en un mfe

- Un mfe actualiza Angular Material a una versión distinta.
- El shell mantiene su versión original.

**Resultado observado** (dependiendo del caso concreto):

- Errores de build o runtime.
- Comportamientos visuales inconsistentes.
- Dificultad para aislar la causa del problema (¿shell o mfe?).

---

## Observaciones

### Dependencias implícitas detectadas

Los mfes dependen implícitamente del host para:

- Paletas de color
- Tipografía
- Density
- Variables CSS globales
- Orden de carga de estilos
- Compatibilidad exacta de versiones de Angular Material

Estas dependencias **no están declaradas**, **no están versionadas** y **no están gobernadas**.

---

### Impacto en la autonomía del mfe

- El mfe no puede:
  - Evolucionar visualmente de forma independiente
  - Probar cambios de theme sin tocar el host
  - Versionar su identidad visual
- El mfe queda ligado al ciclo de cambios del shell.

---

## Qué demuestra este experimento

- Centralizar el theme en el host:
  - Funciona técnicamente
  - Rompe principios fundamentales de microfrontends
- El acoplamiento introducido:
  - Es implícito
  - No es visible en el código del mfe
  - No es controlable mediante versionado
- La “consistencia visual” se logra a costa de:
  - Autonomía
  - Evolución independiente
  - Escalabilidad organizativa

---

## Riesgos evidenciados

### Riesgos técnicos

- Conflictos de versión entre Angular Material y CSS compilado
- Fragilidad ante cambios aparentemente “solo visuales”
- Dificultad para depurar errores de estilos

### Riesgos organizativos

- El shell se convierte en autoridad de diseño de facto
- Los equipos de mfes pierden ownership visual
- Cada cambio visual requiere coordinación centralizada

---

## Conclusión del experimento

Centralizar el theme de Angular Material en el host **no es una solución neutral**.

Aunque permite una apariencia consistente a corto plazo, introduce un nivel de acoplamiento que:

- No es explícito
- No es versionable
- No escala bien con múltiples equipos y mfes

Este experimento **no invalida automáticamente** esta estrategia, pero demuestra que su coste arquitectónico es alto y debe asumirse conscientemente.

En el contexto de microfrontends con alta independencia esperada, esta estrategia debe considerarse **de riesgo elevado**.

---

## Estado

- Hipótesis: **confirmada**
- Uso recomendado: **solo en contextos con bajo nivel de autonomía requerida**
- Necesita contraste con:
  - Experimento 2 — Theme local por mfe
  - Experimento 3 — Design Tokens compartidos + local theme
