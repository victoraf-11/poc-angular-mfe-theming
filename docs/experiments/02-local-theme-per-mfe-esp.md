# Experimento 2 — Theme completamente local por MFE

## Contexto

Arquitectura de microfrontends Angular basada en Native Federation, con un **shell** que actúa únicamente como orquestador de navegación y carga de mfes.

Todos los mfes son aplicaciones Angular independientes que utilizan Angular Material como librería UI.
En este experimento, **cada mfe compila su propio theme de Angular Material**, y el shell no aporta ningún estilo visual.

A diferencia del Experimento 1, aquí se prioriza la **autonomía visual** por encima de la consistencia global.

---

## Hipótesis

Si cada mfe compila su propio theme de Angular Material y el host no define ningún estilo, entonces los mfes pueden evolucionar visualmente de forma independiente.  
Sin embargo, debido al carácter global de parte del CSS de Angular Material, el aislamiento resultante es **parcial y frágil**, dependiendo del orden de carga y de efectos secundarios no evidentes.

---

## Premisas del experimento

Las siguientes condiciones son deliberadas y forman parte del experimento:

### Shell

- No define ningún theme de Angular Material.
- No importa `@angular/material/theming`.
- No utiliza componentes Angular Material.
- No expone estilos globales de ningún tipo.
- Actúa exclusivamente como contenedor y orquestador de mfes.

### MFEs

- Cada mfe:
  - Define su propio theme Material.
  - Compila localmente su SCSS de theme.
  - Decide paletas, modo (light/dark), typography y density.
- No existe:
  - Theme compartido
  - Librería de estilos común
  - Sistema de tokens
- Todos los proyectos usan **la misma versión de Angular y Angular Material**, de forma intencionada, para aislar el experimento únicamente al theming.

---

## Setup técnico relevante

- Framework: Angular 17.x
- UI library: Angular Material 17.x
- Arquitectura: Microfrontends Angular
- Federación: Native Federation (vanilla-native-federation)
- Workspace: Nx LTS + pnpm
- Tipo de mfes: Angular applications (no Web Components)

---

## Implementación del experimento

### Shell

- Se eliminan todos los estilos relacionados con Angular Material.
- No se carga ningún SCSS global relevante.
- El shell no define ninguna decisión visual.

El shell queda visualmente neutro.

---

### MFE-A

- Define un theme Material local (modo light).
- Compila su propio SCSS de theme.
- Usa componentes Material (`mat-toolbar`, `mat-button`, etc.).

### MFE-B

- Define un theme Material local distinto (paletas diferentes, modo dark).
- Compila su propio SCSS de theme.
- Usa los mismos componentes Material que MFE-A.

Cada mfe controla completamente su apariencia **desde su propio build**.

---

## Cambios provocados deliberadamente

### Cambio 1 — Convivencia de mfes con themes distintos

- Se cargan MFE-A y MFE-B simultáneamente desde el shell.

**Observaciones**:

- Cada mfe muestra colores y estilos distintos.
- Visualmente parecen independientes.
- No existe coordinación explícita entre ellos.

---

### Cambio 2 — Estilos globales de Angular Material

Angular Material introduce efectos globales incluso cuando el theme es “local”:

- `body`
- `html`
- Tipografía base (`mat-typography`)
- Density
- Focus styles
- CSS reset parcial

**Observaciones**:

- Algunos estilos globales se aplican a toda la página.
- El resultado depende del orden de carga de los mfes.
- No existe un mecanismo explícito para evitar colisiones.

---

## Observaciones clave

### Aislamiento real vs aislamiento aparente

- Aislado:
  - Paletas de componentes
  - Apariencia local de toolbars, botones, inputs
- No completamente aislado:
  - Tipografía global
  - Density
  - Estilos base del documento
  - Focus y accesibilidad

El aislamiento es **suficiente para demos**, pero **débil para escalado**.

---

### Complejidad introducida

- Cada mfe:
  - Decide su propio theme
  - Duplica lógica de configuración Material
- Aumenta el riesgo de:
  - Deriva visual
  - Inconsistencias de UX
  - Falta de identidad de producto

No hay acoplamiento técnico fuerte, pero sí **fragmentación**.

---

## Qué demuestra este experimento

- Compilar el theme localmente por mfe:
  - Mejora claramente la autonomía
  - Elimina el acoplamiento directo con el shell
- Angular Material:
  - No está diseñado para aislamiento estricto por aplicación
  - Introduce efectos globales difíciles de controlar
- La independencia lograda es:
  - Real a nivel de build
  - Parcial a nivel de CSS global

---

## Riesgos evidenciados

### Riesgos técnicos

- Colisiones silenciosas de estilos globales
- Dependencia implícita del orden de carga
- Dificultad para garantizar determinismo visual

### Riesgos organizativos

- Falta de consistencia visual entre mfes
- Ausencia de gobernanza de diseño
- Dificultad para evolucionar hacia una identidad común

---

## Conclusión del experimento

El theming completamente local por mfe **respeta mucho mejor los principios de microfrontends** que la centralización en el host.

Sin embargo, Angular Material introduce efectos globales que limitan el aislamiento real y pueden generar problemas sutiles a medio y largo plazo si no existe ningún mecanismo de coordinación.

Este enfoque es válido cuando:

- La autonomía del mfe es prioritaria
- La consistencia visual no es crítica
- El número de mfes es reducido

No es una solución escalable por sí sola sin introducir algún tipo de contrato compartido.

---

## Estado

- Hipótesis: **parcialmente confirmada**
- Autonomía: **alta**
- Consistencia visual: **baja**
- Aislamiento real: **incompleto**

Este experimento justifica la necesidad de una tercera estrategia:
**tokens compartidos + theme compilado localmente**.
