import { Federations, FederationType } from '@org/federation-core';
import { NativeFederation } from '@org/native-federation';
import { initFederation } from 'vanilla-native-federation';
import { consoleLogger, NFOptions, useShimImportMap } from 'vanilla-native-federation/options';

// Move the remote URL to the environment config if you want to use different urls for each environment
const manifest = {
  'mfe-a': 'http://localhost:4201/remoteEntry.json',
  'mfe-b': 'http://localhost:4202/remoteEntry.json',
};

async function bootstrap() {
  try {
    const nf = await initFederation(manifest, {
      logger: consoleLogger,
      hostRemoteEntry: './remoteEntry.json',
      logLevel: 'debug',
      profile: {
        latestSharedExternal: true,
        overrideCachedRemotesIfURLMatches: true,
      },
      ...useShimImportMap({ shimMode: true }),
    } as NFOptions);

    const federations: Federations = new Set();

    federations.add({
      key: 'nf',
      name: 'Native Federation',
      type: FederationType.NATIVE_FEDERATION,
      loader: nf.loadRemoteModule,
      utilities: { ...nf },
    } as NativeFederation);

    const config = {
      federations,
    };

    const app = await import('./bootstrap');
    await app.bootstrapApp(config);
  } catch (err) {
    console.error('Failed to load');
    console.error(err);
  }
}

bootstrap();
