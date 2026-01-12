import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  Federation,
  MODULE_FEDERATION,
  MODULE_FEDERATION_LOADER,
} from '@org/federation-core';

export function provideModuleFederation(
  federation: Federation,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: MODULE_FEDERATION,
      useValue: federation,
    },
    {
      provide: MODULE_FEDERATION_LOADER,
      useValue: federation.loader,
    },
  ]);
}
