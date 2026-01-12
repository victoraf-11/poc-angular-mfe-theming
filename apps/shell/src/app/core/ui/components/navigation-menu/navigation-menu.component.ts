import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation-menu.component.html',
  styleUrl: './navigation-menu.component.scss',
})
export class NavigationMenuComponent {
  private readonly router = inject(Router);

  menuItems: MenuItem[] = [
    {
      label: 'Shell',
      path: '/',
    },
    {
      label: 'MFE A',
      path: '/mfe-a',
    },
    {
      label: 'MFE B',
      path: '/mfe-b',
    },
  ];

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isActiveRoute(path: string): boolean {
    if (path === '/') {
      return this.router.url === '/';
    }

    return this.router.url.startsWith(path);
  }
}
