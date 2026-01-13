import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { appRoutes } from './app.routes';
import { FederationType } from '@org/federation-core';
import { AppConfig } from './core/domain/models/app-config.models';

export const appConfig: (config: AppConfig) => ApplicationConfig = config => {
  const { federations } = config;

  const nativeFederation = Array.from(federations).find(
    federation => federation.type === FederationType.NATIVE_FEDERATION
  );

  if (!nativeFederation) {
    throw new Error('Native Federation is required for this application to run.');
  }

  return {
    providers: [
      provideRouter(appRoutes(federations)),
      // =====================================================================
      // provideAnimations() is required by MFEs that use Angular Material
      // components with animations (e.g., MatFormField).
      //
      // The shell does NOT need this provider for its own components, but
      // MUST declare it because MFEs execute within the shell's injector
      // context at runtime.
      //
      // This creates an IMPLICIT DEPENDENCY:
      // - MFEs require provideAnimations() to function
      // - Shell must know about and declare this provider
      // - If shell doesn't declare it, MFEs break at runtime
      // - MFEs MUST document their provider requirements
      provideAnimations(),
    ],
  };
};
