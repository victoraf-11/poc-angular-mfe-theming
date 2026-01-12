import { RouteModule } from './federation-modules.model';

export type FederationLoader<T = RouteModule> = (
  name: string,
  remotePath: string,
  ...args: unknown[]
) => Promise<T>;

export type FederationUtilities = Record<string, unknown>;

export enum FederationType {
  NATIVE_FEDERATION = 'NATIVE_FEDERATION',
  MODULE_FEDERATION = 'MODULE_FEDERATION',
}

export const FEDERATION_KEYS = ['nf', 'mf'] as const;
export type FederationKey = (typeof FEDERATION_KEYS)[number];

export interface FederationBase {
  key: FederationKey;
  name: string;
  type: FederationType;
  loader: FederationLoader;
  utilities?: FederationUtilities;
}

export type Federation = FederationBase;
export type Federations = Set<Federation>;
