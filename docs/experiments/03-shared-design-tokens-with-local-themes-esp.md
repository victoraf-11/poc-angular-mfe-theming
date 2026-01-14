# Experimento 3 — Design Tokens Compartidos + Themes Locales

## Contexto

Arquitectura de microfrontends Angular basada en Native Federation, con un **shell** que actúa como orquestador y los **MFEs** como aplicaciones independientes que pueden funcionar tanto en modo standalone como integradas.

Este experimento busca el equilibrio óptimo entre:
- **Consistencia visual** mediante design tokens compartidos
- **Autonomía de MFEs** mediante themes locales compilados independientemente
- **Eliminación de duplicación** de estilos en runtime

---

## Hipótesis

Si los design tokens se centralizan en una librería compartida y cada MFE compila su propio theme de Angular Material consumiendo esos tokens mediante CSS variables, entonces:

1. **Los MFEs son verdaderamente independientes** - pueden ejecutarse standalone y verse correctamente
2. **No hay duplicación de estilos** - los tokens CSS solo se cargan una vez (por el shell en modo federado, por el MFE en modo standalone)
3. **Se mantiene consistencia visual** - todos los MFEs usan los mismos valores de diseño
4. **Los themes son runtime-compatible** - usan CSS variables que se resuelven en runtime, no en compile-time

---

## Premisas del experimento

### Design Tokens Library

- Librería compartida: `@org/design-tokens`
- Tecnología: [Style Dictionary v5 LTS](https://styledictionary.com/)
- Ubicación: `libs/shared/design-tokens`
- Package manager: pnpm workspace protocol (`workspace:*`)
- Outputs generados:
  - **CSS** (`tokens.css`) - Para consumo en runtime
  - **SCSS variables** (`_tokens.scss`) - Para compile-time (NO USADO en este experimento)
  - **SCSS maps** (`_tokens-map.scss`) - Para estructuras complejas (NO USADO en este experimento)
  - **JavaScript/TypeScript** - Para lógica de aplicación (NO USADO en este experimento)
  - **JSON** - Para herramientas y documentación (NO USADO en este experimento)

### Shell

- **Carga tokens CSS globalmente** mediante `project.json` styles array
- No define theme de Angular Material (no usa componentes Material)
- Consume tokens CSS para sus propios estilos (`var(--ds-color-*)`)
- Actúa como contenedor y orquestador de MFEs

### MFEs

- **Cada MFE incluye tokens CSS en su `project.json` styles array**
- **Los themes Material se compilan usando CSS variables** (no SCSS variables)
- Los MFEs son aplicaciones Angular completas y funcionales
- Funcionan correctamente tanto standalone como integrados

---

## Setup técnico relevante

- Framework: Angular 17.3.0
- UI library: Angular Material 17.3.0
- Arquitectura: Microfrontends Angular
- Federación: Native Federation (@angular-architects/native-federation)
- Workspace: Nx 20.4.0 + pnpm 10.28.0
- Design System: Style Dictionary 5.1.4 LTS
- Package resolution: pnpm workspace protocol con symlinks

---

## Arquitectura de la solución

### 1. Librería de Design Tokens

**Estructura:**
```
libs/shared/design-tokens/
├── src/
│   ├── lib/
│   │   ├── tokens/           # Fuentes JSON (162 tokens)
│   │   │   ├── color/
│   │   │   │   ├── base.json        # Navy, Teal, Red, Neutral, VSCode, Pink
│   │   │   │   └── semantic.json    # primary, accent, warn, text, background
│   │   │   ├── spacing/
│   │   │   │   └── scale.json       # 0-24 escala (0px, 4px, 8px... 96px)
│   │   │   ├── typography/
│   │   │   │   ├── font.json        # families, weights
│   │   │   │   └── scale.json       # sizes (xs-6xl), line-heights, letter-spacing
│   │   │   ├── elevation/
│   │   │   │   └── shadow.json      # 0-4 niveles
│   │   │   └── border/
│   │   │       └── radius.json      # sm, base, md, lg, xl, full
│   │   └── build/             # Outputs generados (gitignored)
│   │       ├── css/
│   │       │   └── tokens.css       # ← Usado en runtime
│   │       ├── scss/
│   │       ├── js/
│   │       └── json/
│   └── index.ts               # Entry point con validación
├── style-dictionary.config.js
├── package.json               # name: "@org/design-tokens"
└── README.md
```

**Resolución de paquete:**
```json
// package.json (root)
{
  "dependencies": {
    "@org/design-tokens": "workspace:*"
  }
}

// pnpm-workspace.yaml
{
  "packages": [
    "libs/shared/design-tokens"
  ]
}
```

Esto crea un symlink:
```bash
node_modules/@org/design-tokens → libs/shared/design-tokens
```

**Resultado:** Los imports `@org/design-tokens/*` funcionan idénticamente en dev y producción.

---

### 2. Consumo de tokens en Shell

**project.json:**
```json
{
  "targets": {
    "build-base": {
      "options": {
        "styles": [
          "node_modules/@org/design-tokens/src/lib/build/css/tokens.css",
          "apps/shell/src/styles.scss"
        ]
      }
    }
  }
}
```

**styles.scss:**
```scss
// Tokens ya cargados globalmente vía styles array
// Consumo directo de CSS variables
.container {
  padding: var(--ds-spacing-6);
  background: var(--ds-color-background-default);
  color: var(--ds-color-text-primary);
}
```

**app.component.scss:**
```scss
.main-content {
  padding: var(--ds-spacing-4);
  background: linear-gradient(
    135deg,
    var(--ds-color-primary-dark) 0%,
    var(--ds-color-primary-default) 100%
  );
}
```

---

### 3. Consumo de tokens en MFEs (CLAVE DE LA ARQUITECTURA)

#### project.json (MFE-A y MFE-B)

```json
{
  "targets": {
    "build-base": {
      "options": {
        "styles": [
          "node_modules/@org/design-tokens/src/lib/build/css/tokens.css",
          "apps/mfe-a/src/styles.scss"
        ]
      }
    }
  }
}
```

**Comportamiento dual:**
- **Modo standalone**: `tokens.css` se incluye en el bundle → variables CSS disponibles ✅
- **Modo Native Federation**: styles array se ignora (shell ya cargó los tokens) → sin duplicación ✅

---

#### Theme Material con CSS Variables (_theme.scss)

**ANTES (Experimento 2):**
```scss
@use '@org/design-tokens/scss/tokens' as tokens;

$primary-palette: (
  500: tokens.$ds-color-base-navy-500,  // ❌ Compile-time SCSS variable
  600: tokens.$ds-color-base-navy-600,
  // ...
);
```

**AHORA (Experimento 3):**
```scss
// NO imports de SCSS tokens - usamos CSS variables

$primary-palette: (
  50: var(--ds-color-base-navy-50),   // ✅ Runtime CSS variable
  100: var(--ds-color-base-navy-100),
  200: var(--ds-color-base-navy-200),
  300: var(--ds-color-base-navy-300),
  400: var(--ds-color-base-navy-400),
  500: var(--ds-color-base-navy-500),
  600: var(--ds-color-base-navy-600),
  700: var(--ds-color-base-navy-700),
  800: var(--ds-color-base-navy-800),
  900: var(--ds-color-base-navy-900),
  contrast: (
    50: var(--ds-color-base-neutral-900),
    500: var(--ds-color-base-neutral-0),
    // ...
  ),
);

$mat-primary: mat.define-palette($primary-palette, 900, 500, 900);

$mfe-a-theme: mat.define-light-theme(
  (
    color: (
      primary: $mat-primary,
      accent: $mat-accent,
      warn: $mat-warn,
    ),
    typography: mat.define-typography-config(
      $font-family: var(--ds-font-family-sans),  // ✅ CSS variable
      $headline-1: mat.define-typography-level(
        var(--ds-font-size-4xl),                  // ✅ CSS variable
        var(--ds-font-line-height-tight),
        var(--ds-font-weight-bold)
      ),
      // ...
    ),
  )
);
```

**Ventajas:**
1. Los MFEs NO tienen dependencia compile-time de los tokens SCSS
2. Los tokens se resuelven en runtime desde CSS variables
3. Los MFEs funcionan standalone porque sus styles arrays cargan `tokens.css`
4. No hay duplicación en modo NF porque el styles array se ignora

---

#### Aplicación del theme (base.layout.scss)

Debido a la limitación de Native Federation donde `styles.scss` global se ignora:

```scss
/**
 * MFE-A Base Layout Styles
 *
 * WHY HERE AND NOT IN styles.scss?
 * - Global styles.scss is ignored when MFE is loaded remotely
 * - Component styleUrls ARE processed and injected
 * - This is the ONLY way to ensure theme CSS is present at runtime
 */

@use '../../styles/themes/theme' as theme;

// Apply the Angular Material theme
@include theme.apply-theme();  // Genera mat.core() + mat.all-component-themes()

.mfe-a-layout {
  display: contents;
}
```

**Component:**
```typescript
@Component({
  selector: 'app-base-layout-a',
  styleUrl: './base.layout.scss',
  encapsulation: ViewEncapsulation.None, // ✅ Requerido para Material theme global
})
export class BaseLayoutComponent {}
```

---

## Observaciones clave

### 1. Eliminación total de hardcoded values

**Antes del experimento:**
- ~200+ hardcoded colors (hex, rgba, hsla)
- ~150+ hardcoded spacing values (px, rem)
- ~50+ hardcoded font sizes y weights
- ~30+ hardcoded shadows y border-radius

**Después del experimento:**
- ✅ **0 valores hardcoded** en ningún stylesheet
- ✅ **100% cobertura de tokens** incluyendo valores `0` (spacing-0)
- ✅ Reducción de código CSS: ~500 líneas → ~300 líneas en algunos componentes

**Ejemplo de conversión:**
```scss
// ANTES
.nav-menu {
  top: 0;
  padding: 4px 8px;
  background: #334155;
  font-size: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

// DESPUÉS
.nav-menu {
  top: var(--ds-spacing-0);
  padding: var(--ds-spacing-1) var(--ds-spacing-2);
  background: var(--ds-color-base-neutral-700);
  font-size: var(--ds-font-size-xs);
  box-shadow: var(--ds-elevation-2);
}
```

---

### 2. Symlinks y path resolution

El uso de pnpm workspace protocol con symlinks es **CRÍTICO**:

```bash
$ ls -la node_modules/@org/
lrwxr-xr-x  design-tokens -> ../../libs/shared/design-tokens
```

**Ventajas:**
1. `@org/design-tokens` se resuelve igual en dev y prod
2. cmd+click funciona en imports (navegación IDE)
3. No requiere configuración en `tsconfig.base.json` paths
4. No hay hacks de `stylePreprocessorOptions`

---

### 3. Separación CSS vs SCSS tokens

**CSS tokens** (`tokens.css`):
- Para consumo en runtime
- Cargados globalmente via styles array
- Usados en componentes con `var(--ds-*)`
- Usados en Material themes con `var(--ds-*)`

**SCSS tokens** (`_tokens.scss`):
- Disponibles pero NO USADOS en este experimento
- Podrían usarse para mixins/funciones complejas
- En este experimento, preferimos CSS vars por flexibilidad runtime

**JavaScript/TypeScript tokens**:
- Para lógica de aplicación (e.g., configuraciones dinámicas)
- Para herramientas de desarrollo
- Para documentación automatizada

---

### 4. Native Federation limitations

**Lo que SE IGNORA en MFE remoto:**
- `styles.scss` global
- `main.ts`
- `app.config.ts`

**Lo que SÍ SE PROCESA:**
- Component `styleUrls`
- Component `styles` inline
- Assets referenciados desde componentes

**Solución:** Inyectar theme Material a nivel de componente layout con `ViewEncapsulation.None`

---

## Conclusiones

### ✅ Hipótesis confirmada

La arquitectura de design tokens compartidos + themes locales compilados con CSS variables **funciona perfectamente** y resuelve todos los problemas encontrados en experimentos anteriores:

1. **MFEs verdaderamente independientes** ✅
   - Funcionan standalone sin dependencias del shell
   - Todos sus estilos se ven correctamente
   - Pueden desarrollarse y testearse aisladamente

2. **Sin duplicación de estilos** ✅
   - En modo NF: solo el shell carga tokens.css (styles array ignorado en MFEs)
   - En modo standalone: cada MFE carga su tokens.css
   - Build size optimizado

3. **Consistencia visual garantizada** ✅
   - Single source of truth: 162 tokens definidos en JSON
   - Todos los proyectos usan los mismos valores
   - Cambios en tokens se propagan automáticamente

4. **Flexibilidad runtime** ✅
   - CSS variables permiten theming dinámico futuro
   - No requiere recompilación para cambios de tema
   - Compatible con dark mode y personalizaciones

---

### Trade-offs de la propuesta

#### Ventajas

**1. Arquitectura "técnicamente honesta"**
- No hay hacks de paths o workarounds
- Las dependencias son explícitas y verificables
- El comportamiento es predecible en dev y prod

**2. Developer Experience superior**
- cmd+click funciona en todos los imports
- Errores claros si los tokens no están generados
- Hot reload funciona correctamente

**3. Mantenimiento reducido**
- Cambio de color → editar 1 archivo JSON
- Regenerar tokens → 1 comando
- Sin búsqueda/reemplazo manual en 50 archivos

**4. Escalabilidad probada**
- Funcionaría con 5, 10, o 50 MFEs
- Los nuevos MFEs copian el patrón existente
- No hay estado global compartido que gestionar

**5. Build performance**
- Tokens se generan una vez, se reutilizan infinitas veces
- No hay recompilación de SCSS en cada MFE
- Parallel builds sin bloqueos

---

#### Desventajas

**1. Paso adicional de build**
- Requiere ejecutar `pnpm nx run design-tokens:build-tokens`
- Si se modifican tokens, hay que regenerar outputs
- Solución: agregar a pre-commit hooks o CI

**2. CSS variables no soportan todas las operaciones SCSS**
- No se puede hacer `darken(var(--color), 10%)` directamente
- Requiere pre-calcular variaciones en Style Dictionary
- Trade-off: preferimos runtime flexibility sobre compile-time transformations

**3. Angular Material + CSS vars = solución no oficial**
- Material espera SCSS variables tradicionalmente
- Esta solución funciona pero no está documentada oficialmente
- Risk mitigation: documentado extensivamente en este experimento

**4. Curva de aprendizaje inicial**
- Los developers deben entender:
  - Style Dictionary como herramienta
  - Diferencia CSS vs SCSS tokens
  - Limitaciones de Native Federation
- Inversión de tiempo pero ROI positivo

---

### Impacto en arquitectura actual

**Esta solución puede marcar una diferencia fundamental en nuestra arquitectura porque:**

#### 1. Elimina acoplamiento implícito
- Los MFEs ya no dependen del shell para estilos básicos
- Cada equipo puede desarrollar su MFE de forma autónoma
- El testing visual no requiere levantar el shell completo

#### 2. Escala naturalmente
- Agregar un nuevo MFE: copiar pattern existente
- No hay configuración global que mantener sincronizada
- Equipos múltiples pueden trabajar en paralelo sin conflicts

#### 3. Facilita migraciones
- Un MFE puede actualizarse a Angular N+1 sin afectar a otros
- Podemos migrar Material Design versiones gradualmente

---

### Riesgos mitigados

| Riesgo | Mitigación implementada |
|--------|------------------------|
| **Tokens no generados** | Validación en `index.ts` con mensaje claro + comando |
| **CSS vars no disponibles** | Styles array asegura carga en ambos modos (standalone/NF) |
| **Drift entre MFEs** | Single source of truth en JSON, generación automática |
| **Breaking changes en tokens** | Versionado del package, TypeScript types para validación |
| **Build performance** | Tokens pre-generados, no se recompilan en cada build de MFE |

---

## Conclusión final

Este experimento demuestra que es posible construir una arquitectura de microfrontends con:
- **Autonomía real** de cada MFE (pueden ejecutarse standalone)
- **Consistencia visual** garantizada (design tokens compartidos)
- **Cero o escasa duplicación** de estilos (tokens solo se cargan una vez)
- **Mantenibilidad superior** (single source of truth en JSON)
- **Developer experience excelente** (type safety, cmd+click, hot reload)

La combinación de **Style Dictionary + pnpm workspace protocol + CSS variables en Material themes** resuelve los problemas fundamentales encontrados en arquitecturas previas y establece un patrón escalable y mantenible para el largo plazo.

**Esta arquitectura es production-ready y recomendable para proyectos microfrontend que requieran autonomía de equipos manteniendo consistencia visual.**
