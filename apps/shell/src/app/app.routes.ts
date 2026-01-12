import { Route } from '@angular/router';
import { Federations, FederationType } from '@org/federation-core';

export const appRoutes = (federations: Federations): Route[] => {
  const nativeFederation = Array.from(federations).find(
    (federation) => federation.type === FederationType.NATIVE_FEDERATION,
  );

  if (!nativeFederation) {
    throw new Error('Native federation configuration is missing');
  }

  const { loader: loadNfRemoteModule } = nativeFederation;

  return [
    {
      path: '',
      loadComponent: () =>
        import('./core/ui/pages/root-page/root.page').then((p) => p.RootPage),
    },
    {
      path: 'mfe-a',
      loadChildren: () =>
        loadNfRemoteModule('mfeA', './Routes').then((m) => m.appRoutes),
    },
    {
      path: 'mfe-b',
      loadChildren: () =>
        loadNfRemoteModule('mfeB', './Routes').then((m) => m.appRoutes),
    },
  ];
};
