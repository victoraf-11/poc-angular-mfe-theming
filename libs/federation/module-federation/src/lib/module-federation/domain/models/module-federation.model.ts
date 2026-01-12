import { FederationBase, FederationType } from '@org/federation-core';

export interface ModuleFederation extends FederationBase {
  type: FederationType.MODULE_FEDERATION;
}
