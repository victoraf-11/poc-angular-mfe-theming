import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

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
 * If mfe-b is run standalone (without the shell), these components will
 * render WITHOUT proper styling.
 * =====================================================================
 */
@Component({
  selector: 'app-root.page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './root.page.html',
  styleUrl: './root.page.scss',
})
export class RootPage {
  readonly mfeName = 'MFE-B';
  readonly themeSource = 'Host (Shell)';
  userName = '';
  selectedPriority = '';

  priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];
}
