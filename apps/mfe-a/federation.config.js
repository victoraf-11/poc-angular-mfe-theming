const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'mfe-a',
  exposes: {
    './Routes': './apps/mfe-a/src/app/app.routes.ts',
  },
  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    }),
  },
  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    'compression',
    'tty',
    pkg => pkg.startsWith('vanilla-native-federation'),
    pkg => pkg.startsWith('@org/federation-core'),
    pkg => pkg.startsWith('@org/module-federation'),
    pkg => pkg.startsWith('@org/native-federation'),
    // Add further packages you don't need at runtime
  ],
  features: {
    mappingVersion: true,
    ignoreUnusedDeps: true,
  },
});
