import { FederationBase, FederationType } from '@org/federation-core';

export interface NativeFederation extends FederationBase {
  type: FederationType.NATIVE_FEDERATION;
}
