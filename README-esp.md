# PoC — Theming en Microfrontends Angular

> **Rama definitiva:** `baseline/mfe-theming-with-shared-design-tokens`  
> Esta rama contiene toda la documentación de los experimentos realizados y el proyecto reproducible con la solución elegida.

---

## 1. Propósito de esta PoC

Esta Proof of Concept (PoC) **no pretende validar una implementación funcional**, sino servir como **instrumento de decisión arquitectónica** sobre cómo abordar el theming en una arquitectura de microfrontends Angular utilizando Angular Material.

El objetivo principal es **evaluar el grado de acoplamiento, autoridad de diseño y viabilidad real** de distintas estrategias de theming, teniendo en cuenta las **restricciones reales de Angular Material** y los principios fundamentales de microfrontends (ownership, independencia y evolución desacoplada).

Esta PoC debe responder *por qué* una estrategia es aceptable o no en un contexto determinado, no *cómo* implementarla de forma óptima.

---

## 2. Qué preguntas pretende responder

Esta PoC existe para responder, con evidencia técnica y análisis crítico, a las siguientes preguntas:

1. ¿Es viable desacoplar el theming de Angular Material del host sin introducir hacks o dependencias frágiles?
2. ¿Dónde aparece realmente el acoplamiento entre host y microfrontends en cada estrategia?
3. ¿Quién ejerce la autoridad del diseño y cómo se manifiesta ese poder técnicamente?
4. ¿Qué impacto tiene cada enfoque en el despliegue independiente de los microfrontends?
5. ¿Qué estrategia degrada peor a medio y largo plazo, incluso si funciona inicialmente?

Si al finalizar la PoC estas preguntas no pueden responderse con claridad, la PoC debe considerarse fallida.

---

## 3. Contexto técnico y restricciones

### Stack

* Framework: Angular 17+
* UI Library: Angular Material 17+
* Arquitectura: Microfrontends Angular (apps, no Web Components)
* Federation: Module Federation o Native Federation (no es objeto de evaluación)

### Restricciones explícitas

* Angular Material **compila el theming en build-time**, no en runtime.
* No existe soporte oficial para inyección dinámica de themes completos.
* El CSS generado por Material **no es un contrato estable entre versiones**.

Estas restricciones no son hipótesis: son hechos verificables que condicionan cualquier enfoque evaluado.

---

## 4. Qué NO es esta PoC

Para evitar conclusiones erróneas, es importante aclarar lo que esta PoC **no** evalúa:

* No evalúa performance ni tamaño de bundle.
* No implementa un design system corporativo completo.
* No aborda dark mode dinámico en runtime.
* No persigue consistencia visual perfecta.
* No simula un entorno de producción real.

Cualquier conclusión basada en estos aspectos queda explícitamente fuera del alcance.

---

## 5. Estrategias evaluadas

Esta PoC evalúa **tres estrategias de theming**, cada una aislada en una rama independiente del repositorio:

1. **Theme centralizado en el host**
   El host define y distribuye el theme de Angular Material a los microfrontends.

2. **Theme definido por cada microfrontend**
   Cada microfrontend compila y gestiona su propio theme de Angular Material.

3. **Design tokens compartidos + theme local**
   Los microfrontends comparten tokens de diseño versionados, pero compilan localmente su theme Material.

Cada estrategia se evalúa como una hipótesis independiente, no como una evolución incremental.

---

## 6. Criterios de evaluación

Cada experimento se analiza obligatoriamente según los siguientes ejes:

1. Grado de desacoplamiento real host ↔ microfrontend.
2. Autoridad del diseño (explícita o implícita).
3. Autonomía de despliegue y versionado.
4. Complejidad técnica y cognitiva.
5. Escalabilidad organizativa.
6. Compatibilidad con futuras versiones de Angular y Angular Material.
7. Riesgos técnicos explícitos.
8. Riesgos implícitos a medio y largo plazo.

La ausencia de análisis en alguno de estos puntos invalida el experimento.

---

## 7. Estructura del repositorio

La estructura del repositorio está diseñada para **controlar variables**, no para simular producción:

```
/apps
  /shell
  /mfe-a
  /mfe-b

/libs
  /shared
    /design-tokens

/docs
  README.md
  experiments.md
  adr.md
```

Notas clave:

* `libs/shared/design-tokens` **es una librería compartida de tokens de diseño**.
* Los microfrontends no comparten código entre sí.
* El monorepo es un **artefacto metodológico**, no una recomendación de arquitectura productiva.

---

## 8. Cómo debe leerse esta PoC

* El código existe para **confirmar o refutar hipótesis**, no para mostrar buenas prácticas de UI.
* El documento tiene prioridad sobre la implementación.
* Si el código contradice el análisis conceptual, **el código gana**.

---

## 9. Resultado esperado

Al finalizar esta PoC debería ser posible:

* Tomar una **decisión arquitectónica informada** sobre el theming.
* Justificar explícitamente el grado de acoplamiento aceptado.
* Documentar trade-offs no negociables.
* Detectar señales de alerta que bloqueen una adopción prematura.

Esta PoC no concluye qué estrategia es “la mejor” de forma universal, sino **en qué contextos cada una es aceptable o peligrosa**.
