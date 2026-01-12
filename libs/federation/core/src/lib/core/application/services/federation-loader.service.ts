import { inject, Injectable } from '@angular/core';
import { FederationLoader } from '../../domain/models/federation.model';
import { RouteModule } from '../../domain/models/federation-modules.model';
import {
  NATIVE_FEDERATION_LOADER,
  MODULE_FEDERATION_LOADER,
} from '../../infra/tokens/federation.tokens';

@Injectable({ providedIn: 'root' })
export class FederationLoaderService {
  private readonly nativeLoader = inject<FederationLoader<RouteModule>>(
    NATIVE_FEDERATION_LOADER,
  );

  private readonly moduleLoader = inject<FederationLoader<RouteModule>>(
    MODULE_FEDERATION_LOADER,
  );

  loadNfRemoteModule(
    name: string,
    remotePath: string,
    ...args: unknown[]
  ): Promise<RouteModule> {
    return this.nativeLoader(name, remotePath, ...args);
  }

  loadMfRemoteModule(
    name: string,
    remotePath: string,
    ...args: unknown[]
  ): Promise<RouteModule> {
    return this.moduleLoader(name, remotePath, ...args);
  }
}
