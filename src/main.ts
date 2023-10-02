import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// #region Extensions
import './app/extensions/array';
// #endregion


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
