import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BaseLayout } from '../../layouts/base/base.layout';

/**
 * MFE-A Root Page - EXPERIMENT 02
 *
 * This component uses Angular Material with a LOCALLY COMPILED THEME.
 *
 * CRITICAL: Theme is imported via BaseLayout, NOT via styles.scss
 * because global MFE styles are ignored when loaded via Native Federation.
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
    MatChipsModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    BaseLayout,
  ],
  templateUrl: './root.page.html',
  styleUrl: './root.page.scss',
})
export class RootPage {
  readonly mfeName = 'MFE-A';
  readonly themeType = '"Ocean Blue" Brand';
  readonly expectedPrimaryColor = '#0066cc'; // Custom Ocean Blue
  readonly expectedAccentColor = '#00a896'; // Custom Energetic Teal
  counter = 0;
  toggleValue = false;

  increment(): void {
    this.counter++;
  }

  decrement(): void {
    this.counter--;
  }
}
