import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { BaseLayout } from '../../layouts/base/base.layout';

/**
 * MFE-B Root Page - EXPERIMENT 02
 *
 * This component uses Angular Material with a LOCALLY COMPILED THEME.
 *
 * CRITICAL: Theme is imported via BaseLayoutComponent, NOT via styles.scss
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    BaseLayout,
  ],
  templateUrl: './root.page.html',
  styleUrl: './root.page.scss',
})
export class RootPage {
  readonly mfeName = 'MFE-B';
  readonly themeType = '"Deep Slate Blue" Brand';
  readonly expectedPrimaryColor = '#334155'; // Custom Deep Slate Blue
  readonly expectedAccentColor = '#06b6d4'; // Custom Bright Cyan
  userName = '';
  selectedPriority = '';
  sliderValue = 50;
  checkboxValue = false;

  priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];
}
