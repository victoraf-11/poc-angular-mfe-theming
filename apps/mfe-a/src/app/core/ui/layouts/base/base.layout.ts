import { Component, ViewEncapsulation } from '@angular/core';

/**
 * MFE-A Base Layout
 *
 * CRITICAL ARCHITECTURAL FINDING:
 *
 * The global styles.scss of MFEs are IGNORED at runtime when loaded via Native Federation.
 * The shell controls the bootstrap process and MFE global styles are not injected.
 *
 * PROBLEM:
 * - MFE's styles.scss with @use './themes/theme' is NOT loaded
 * - mat.core() and mat.all-component-themes() are never executed
 * - Material components render UNSTYLED
 *
 * SOLUTION:
 * - Create a Layout component that imports the theme
 * - Wrap all pages with this Layout
 * - The Layout component's styles ARE processed and injected at runtime
 * - Use ViewEncapsulation.None so Material styles are GLOBAL (required)
 *
 * This Layout serves as the injection point for:
 * - Angular Material theme compilation
 * - Global CDK styles (mat.core)
 * - Component themes (mat.all-component-themes)
 *
 * ARCHITECTURAL IMPLICATION:
 * Even "local theming per MFE" requires a component-level injection strategy.
 * MFE autonomy is constrained by the federation bootstrap mechanism.
 */
@Component({
  selector: 'app-base-layout-a',
  standalone: true,
  templateUrl: './base.layout.html',
  styleUrl: './base.layout.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BaseLayout {}
