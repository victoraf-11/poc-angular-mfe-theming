import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch((err) => console.error('Error during federation initialization', err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error('Error during app bootstrap', err));
