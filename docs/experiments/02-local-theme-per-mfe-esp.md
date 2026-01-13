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
- No hay imports de `@angular/material` en `styles.scss`.
- No se ejecuta `mat.core()` ni `mat.all-component-themes()`.
- Usa fuentes del sistema en lugar de Roboto.
- El shell queda visualmente neutro — orquestador puro.

**Shell styles.scss:**
```scss
/* SIN theming de Material - el shell es orquestador puro */
html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
}
```

---

### MFE-A

- **Paleta Primaria:** "Ocean Blue" personalizada (`#0066cc`)
- **Paleta Accent:** "Energetic Teal" personalizada (`#00a896`)
- **Paleta Warn:** Rojo personalizado
- **Density:** 0 (por defecto)
- **Typography:** Roboto, headline-1 a 32px/40px

Compila su propio theme mediante:
```scss
@use '@angular/material' as mat;
@include mat.core();
@include mat.all-component-themes($mfe-a-theme);
```

### MFE-B

- **Paleta Primaria:** "Deep Slate Blue" personalizada (`#334155`)
- **Paleta Accent:** "Bright Cyan" personalizada (`#06b6d4`)
- **Paleta Warn:** Ámbar personalizado
- **Density:** -1 (compacto)
- **Typography:** Segoe UI, headline-1 a 36px/44px

Compila su propio theme mediante:
```scss
@use '@angular/material' as mat;
@include mat.core();
@include mat.all-component-themes($mfe-b-theme);
```

Cada mfe controla completamente su apariencia **desde su propio build**.

---

## Hallazgo Crítico de Native Federation

### Problema: Los estilos globales de MFE se ignoran en runtime

**LIMITACIÓN DESCUBIERTA:**
Los archivos `styles.scss` de los MFEs **NO se cargan** cuando el MFE se consume vía Native Federation.

**Por qué ocurre esto:**
- El shell controla el proceso de bootstrap (`main.ts`, `app.config.ts`)
- Solo el `styles.scss` del shell se inyecta en el documento
- Los estilos globales de MFE se excluyen del bundle de federación en runtime
- Similar a cómo `main.ts` y `app.config.ts` de los MFEs se ignoran

**Consecuencia:**
```scss
// apps/mfe-a/src/styles.scss
@use './app/core/ui/styles/themes/theme'; // ❌ IGNORADO EN RUNTIME
```

La compilación del theme nunca se ejecuta. Los componentes Material se renderizan **SIN ESTILOS**.

**Solución: Inyección de estilos a nivel de componente**

En lugar de depender del `styles.scss` global, inyecta el theme mediante un **componente Layout**:

```typescript
// apps/mfe-a/src/app/core/ui/layouts/base/base.layout.ts
@Component({
  selector: 'app-base-layout-a',
  standalone: true,
  templateUrl: './base.layout.html',
  styleUrl: './base.layout.scss',
  encapsulation: ViewEncapsulation.None, // ✅ Requerido para estilos globales de Material
})
export class BaseLayout {}
```

**Por qué `ViewEncapsulation.None` es requerido:**

El `ViewEncapsulation.Emulated` por defecto de Angular encapsula los estilos del componente añadiendo atributos `_ngcontent-*`. Sin embargo, `mat.core()` y `mat.all-component-themes()` de Angular Material generan estilos que DEBEN ser globales (variables `:root`, clases `.mat-*`, overlays CDK). Sin `ViewEncapsulation.None`, estos estilos se encapsularían incorrectamente y los componentes Material no se renderizarían correctamente.

**Limitación conocida: Warning en consola**

```
Could not find Angular Material core theme. Most Material components may not work as expected.
```

Este warning aparece porque Angular Material verifica la presencia del tema muy temprano en el ciclo de vida de la aplicación, ANTES de que el componente Layout se renderice e inyecte los estilos. El warning es **cosmético** — el tema SÍ se aplica correctamente una vez que el componente Layout se inicializa. Esta es una limitación inherente de la inyección de estilos a nivel de componente vs `styles.scss` global.

**Problema crítico de performance: Acumulación de CSS**

Con `ViewEncapsulation.None`, cada vez que un componente BaseLayout se renderiza (en cada navegación), Angular inyecta **NUEVAS** etiquetas `<style>` en el `<head>` del documento. En una SPA sin recarga de página:

- Cada navegación a un MFE añade ~200KB+ de CSS de tema Material
- Las etiquetas de estilo se acumulan infinitamente en el DOM
- Esto causa **memory leak** gradual y **degradación de performance** del parser CSS
- El navegador debe procesar una hoja de estilos en constante crecimiento

Este es un tradeoff inherente de la inyección de estilos a nivel de componente con `ViewEncapsulation.None`. Posibles mitigaciones:

1. **Inyección de estilos singleton**: Verificar si los estilos ya existen antes de inyectar
2. **Tema compartido en shell**: Aceptar el acoplamiento pero evitar duplicación
3. **Enfoque CSS-in-JS**: Usar gestión de estilos en runtime
4. **Aceptar el coste**: Para apps con navegación limitada, puede ser aceptable

```scss
// apps/mfe-a/src/app/core/ui/layouts/base/base.layout.scss
@use '../../styles/themes/theme';

// Aplicar el theme de Angular Material via mixin
@include theme.apply-theme();

.mfe-a-layout {
  display: contents; // Wrapper transparente
}
```

Envuelve todas las páginas ruteadas con este layout:

```html
<app-base-layout-a>
  <mat-card>...</mat-card>
</app-base-layout-a>
```

**Implicación arquitectónica:**

Incluso con "theming local por MFE", no puedes usar estilos globales. El mecanismo de federación restringe dónde pueden inyectarse los estilos. La verdadera autonomía de MFE requiere **inyección de estilos scopeada a componentes**.

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

Angular Material introduce efectos globales incluso cuando el theme es "local":

| Efecto Global | Generado Por | Alcance |
|---------------|--------------|---------|
| Propiedades CSS `:root` | `mat.all-component-themes()` | Documento completo |
| Estilos de tipografía `body` | `mat.core()` | Documento completo |
| Jerarquía `.mat-typography` | `mat.core()` | Documento completo |
| Clases `.cdk-overlay-*` | `mat.core()` | Documento completo |
| Estilos `.cdk-a11y-*` | `mat.core()` | Documento completo |
| Estilos `.mat-ripple` | `mat.core()` | Documento completo |
| Polyfill de focus-visible | `mat.core()` | Documento completo |
| Variables de escala de densidad | `mat.all-component-themes()` | Documento completo |

**Observaciones**:

- Algunos estilos globales se aplican a toda la página.
- El resultado depende del orden de carga de los mfes.
- No existe un mecanismo explícito para evitar colisiones.

---

### Cambio 3 — Prueba de sensibilidad al orden de carga

**Escenario A: MFE-A carga primero, luego MFE-B**
- Se aplica el theme Ocean Blue de MFE-A globalmente
- El theme Deep Slate Blue de MFE-B SOBRESCRIBE todos los estilos globales
- Resultado: AMBOS MFEs aparecen con el theme de MFE-B

**Escenario B: MFE-B carga primero, luego MFE-A**
- Se aplica el theme Deep Slate Blue de MFE-B globalmente
- El theme Ocean Blue de MFE-A SOBRESCRIBE todos los estilos globales
- Resultado: AMBOS MFEs aparecen con el theme de MFE-A

**Hallazgo crítico:** El theme del ÚLTIMO MFE cargado gana para el documento COMPLETO.
No existe mecanismo de scoping para el CSS global de Angular Material.

---

## Observaciones clave

### Lista explícita de efectos secundarios globales observados

1. **Propiedades CSS personalizadas `:root`**
   - Cada theme define variables `--mdc-*` y `--mat-*` en `:root`
   - Son globales al documento y no pueden ser scopeadas
   - El último theme cargado sobrescribe todos los valores previos

2. **Tipografía en `body` y `html`**
   - `mat.core()` establece `font-family`, `font-size` en body
   - Diferentes MFEs definen configuraciones de fuentes distintas
   - Solo una puede ganar (cascada CSS)

3. **Clase `.mat-app-background`**
   - Cada theme establece sus propios colores de fondo
   - Se aplica globalmente, afecta al documento completo

4. **Estilos CDK overlay**
   - `.cdk-overlay-container` posicionado globalmente
   - Diálogos, dropdowns, tooltips usan overlay global
   - El theming afecta a todos los overlays sin importar el MFE origen

5. **Escala de densidad**
   - MFE-A usa density 0, MFE-B usa density -1
   - La última density cargada se aplica a TODOS los componentes
   - Las alturas de botones, tamaños de inputs cambian globalmente

6. **Generación de CSS duplicado**
   - Cada llamada a `mat.core()` genera ~50KB de estilos core
   - Cada `mat.all-component-themes()` genera ~200KB+
   - No hay deduplicación — los estilos se acumulan en el documento

### Aislamiento real vs aislamiento aparente

| Aspecto | ¿Aislado? | Explicación |
|---------|-----------|-------------|
| Paletas de componentes (botones, cards) | **Parcial** | Los colores vienen de propiedades CSS que son globales |
| Apariencia de form fields | **No** | Comparten estilos `.mat-mdc-form-field` globales |
| Jerarquía de tipografía | **No** | Estilos `h1-h6`, `p` son selectores de elemento |
| Density | **No** | Un único valor de densidad se aplica globalmente |
| Overlays (diálogos, menús) | **No** | Usan contenedor overlay global |
| Estilos de foco | **No** | Reglas `:focus-visible` son globales |
| Efectos ripple | **No** | `.mat-ripple` es global |

El aislamiento es **suficiente para demos**, pero **débil para escalado**.

---

### Complejidad introducida

- Cada mfe:
  - Decide su propio theme
  - Duplica lógica de configuración Material
  - Genera sus propios 200KB+ de CSS de theme
- Aumenta el riesgo de:
  - Deriva visual
  - Inconsistencias de UX
  - Falta de identidad de producto
  - Hinchazón de CSS (múltiples compilaciones completas de theme)

No hay acoplamiento técnico fuerte, pero sí **fragmentación**.

---

## Qué demuestra este experimento

- Compilar el theme localmente por mfe:
  - Mejora claramente la autonomía en tiempo de build
  - Elimina el acoplamiento directo con el shell
  - Permite deployments independientes
- Angular Material:
  - No está diseñado para aislamiento estricto por aplicación
  - Introduce efectos globales difíciles de controlar
  - Usa propiedades CSS personalizadas en `:root` que no pueden scopearse
  - Genera CSS duplicado cuando se compila por múltiples aplicaciones
- La independencia lograda es:
  - Real a nivel de build
  - Parcial a nivel de CSS global
  - No determinista en runtime (dependiente del orden de carga)

---

## Análisis de límites de aislamiento

### Qué restringe el modelo de theming de Angular Material

1. **Sin compatibilidad con Shadow DOM**
   - Los componentes de Angular Material no usan Shadow DOM
   - Todos los estilos son CSS global, afectando al documento completo
   - No existe límite de encapsulación

2. **Propiedades CSS personalizadas en `:root`**
   - Los tokens del theme se establecen en `:root` (nivel documento)
   - No pueden scopearse a un subárbol
   - La última definición gana

3. **Selectores de elemento**
   - La tipografía usa selectores `body`, `h1`, `p`
   - Estos no pueden ser prefijados o namespaciados
   - Afectan al documento completo

4. **Infraestructura CDK global**
   - El contenedor overlay se añade a `<body>`
   - Todos los MFEs comparten el mismo contenedor overlay
   - El theming de overlays es global

5. **Sin detección de themes en runtime**
   - `mat.core()` no verifica si ya fue llamado
   - Cada MFE genera CSS completo independientemente
   - No existe mecanismo de coordinación

---

## Riesgos evidenciados

### Riesgos técnicos

| Riesgo | Severidad | Certeza | Descripción |
|--------|-----------|---------|-------------|
| Sensibilidad al orden de carga | **CRÍTICA** | Cierta | El último theme cargado controla el documento completo |
| Hinchazón de CSS | ALTA | Cierta | Cada MFE genera 200KB+ de CSS de theme duplicado |
| Desajuste en theming de overlays | ALTA | Cierta | Diálogos/menús usan theme global, no del MFE origen |
| Visuales no deterministas | ALTA | Cierta | El mismo código produce visuales diferentes según orden de carga |
| Conflictos de densidad | MEDIA | Cierta | Todos los componentes adoptan la última densidad cargada |
| Colisiones de tipografía | MEDIA | Cierta | Tamaños/familias de fuentes cambian globalmente |

### Riesgos organizativos

| Riesgo | Impacto | Descripción |
|--------|---------|-------------|
| No determinismo visual | ALTO | QA no puede verificar apariencia consistente |
| Orden de carga como preocupación de deployment | ALTO | DevOps debe controlar secuencia de carga de MFEs |
| Sin gobernanza de diseño | MEDIO | Los equipos derivan visualmente sin coordinación |
| Complejidad de debugging | MEDIO | Los bugs de theme dependen de qué MFE cargó último |
| Regresión de performance | BAJO | La hinchazón de CSS aumenta peso de página |

---

## Conclusión del experimento

El theming completamente local por mfe **respeta mucho mejor los principios de microfrontends** que la centralización en el host.

Sin embargo, Angular Material introduce efectos globales que limitan el aislamiento real y pueden generar problemas sutiles a medio y largo plazo si no existe ningún mecanismo de coordinación.

### Qué PRUEBA este experimento

1. **La independencia en tiempo de build es alcanzable** — cada MFE puede compilar su propio theme
2. **El aislamiento en runtime NO es alcanzable** — el CSS global de Angular Material lo previene
3. **Native Federation ignora los estilos globales de MFE** — `styles.scss` no se carga en runtime
4. **La inyección a nivel de componente funciona** — via BaseLayout con `ViewEncapsulation.None`
5. **El routing lazy previene colisión de temas** — cada navegación re-inyecta el tema correcto
6. **La acumulación de CSS es un problema crítico** — las etiquetas style se acumulan infinitamente en navegación SPA
7. **Los overlays no pueden aislarse** — usan un contenedor global compartido

### Qué NO prueba este experimento

1. NO prueba que el theming local sea impráctico — funciona para demos y casos simples
2. NO prueba que la divergencia de versiones cause problemas — eso estaba fuera de alcance
3. NO prueba que Shadow DOM lo resolvería — Angular Material no lo soporta
4. NO prueba que CSS containment ayude — la arquitectura de Material lo previene

### Cuándo este enfoque es válido

- La autonomía del MFE es prioritaria sobre la consistencia visual
- La consistencia visual no es crítica (productos diferentes, herramientas internas)
- El número de mfes es pequeño (2-3)
- El orden de carga puede controlarse
- Los equipos aceptan no determinismo visual

### Cuándo este enfoque NO es válido

- Se requiere consistencia de marca entre MFEs
- Más de 3 MFEs coexisten
- El orden de carga no puede garantizarse
- El rendimiento importa (la hinchazón de CSS es inaceptable)
- Los overlays deben coincidir con el theme de su MFE origen

No es una solución escalable por sí sola sin introducir algún tipo de contrato compartido.

---

## Estado

- **Experimento:** COMPLETADO
- Hipótesis: **confirmada con matices**
- Autonomía de build: **alta**
- Aislamiento de runtime: **logrado via routing lazy** (pero el CSS se acumula)
- Consistencia visual: **por-MFE** (cada MFE muestra su tema correctamente)
- Impacto en performance: **negativo** (acumulación de CSS en navegación SPA)

Este experimento justifica la necesidad de una tercera estrategia:
**tokens compartidos + theme compilado localmente** o **aceptar que Angular Material impone theming global al documento como restricción arquitectónica**.
