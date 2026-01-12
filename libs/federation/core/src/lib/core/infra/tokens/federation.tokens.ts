import { InjectionToken } from '@angular/core';
import { Federation, FederationLoader } from '../../domain/models/federation.model';

export const NATIVE_FEDERATION = new InjectionToken<Federation>(
  'NATIVE_FEDERATION',
);

export const NATIVE_FEDERATION_LOADER = new InjectionToken<
  FederationLoader<unknown>
>('NATIVE_FEDERATION_LOADER');

export const MODULE_FEDERATION = new InjectionToken<Federation>(
  'MODULE_FEDERATION',
);

export const MODULE_FEDERATION_LOADER = new InjectionToken<
  FederationLoader<unknown>
>('MODULE_FEDERATION_LOADER');
