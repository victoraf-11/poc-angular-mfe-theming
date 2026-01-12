import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  Federation,
  NATIVE_FEDERATION,
  NATIVE_FEDERATION_LOADER,
} from '@org/federation-core';

export function provideNativeFederation(
  federation: Federation,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NATIVE_FEDERATION,
      useValue: federation,
    },
    {
      provide: NATIVE_FEDERATION_LOADER,
      useValue: federation.loader,
    },
  ]);
}
