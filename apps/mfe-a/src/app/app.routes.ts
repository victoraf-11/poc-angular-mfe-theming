import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./core/ui/pages/root-page/root.page').then((p) => p.RootPage),
  },
];
