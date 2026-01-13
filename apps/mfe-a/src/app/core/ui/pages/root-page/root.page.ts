import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

/**
 * This component imports and uses Angular Material components but does
 * NOT compile any theme. It DEPENDS on the host (shell) having already
 * loaded and applied the Material theme to the DOM.
 *
 * IMPLICIT RUNTIME DEPENDENCIES:
 * - mat.core() must have been called by the host
 * - mat.all-component-themes() must have been called by the host
 * - The host's styles.scss must be loaded BEFORE this component renders
 *
 * If mfe-a is run standalone (without the shell), these components will
 * render WITHOUT proper styling.
 */
@Component({
  selector: 'app-root.page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './root.page.html',
  styleUrl: './root.page.scss',
})
export class RootPage {
  readonly mfeName = 'MFE-A';
  readonly themeSource = 'Host (Shell)';
  counter = 0;

  increment(): void {
    this.counter++;
  }

  decrement(): void {
    this.counter--;
  }
}
