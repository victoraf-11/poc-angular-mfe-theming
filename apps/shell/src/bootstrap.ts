import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig as getAppConfig } from './app/app.config';
import { AppConfig } from './app/core/domain/models/app-config.models';

export async function bootstrapApp(config: AppConfig) {
  const appConfig = getAppConfig(config);

  bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err),
  );
}
