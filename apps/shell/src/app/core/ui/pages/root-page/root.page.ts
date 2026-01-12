import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NxWelcomeComponent } from '../../components/nx-welcome/nx-welcome.component';

@Component({
  selector: 'app-root.page',
  standalone: true,
  imports: [CommonModule, NxWelcomeComponent],
  templateUrl: './root.page.html',
  styleUrl: './root.page.scss',
})
export class RootPage {}
