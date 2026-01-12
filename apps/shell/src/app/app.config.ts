import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { FederationType } from '@org/federation-core';
import { AppConfig } from './core/domain/models/app-config.models';

export const appConfig: (config: AppConfig) => ApplicationConfig = (config) => {
  const { federations } = config;

  const nativeFederation = Array.from(federations).find(
    (federation) => federation.type === FederationType.NATIVE_FEDERATION,
  );

  if (!nativeFederation) {
    throw new Error(
      'Native Federation is required for this application to run.',
    );
  }

  return {
    providers: [provideRouter(appRoutes(federations))],
  };
};
