import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

// #region Extensions
import './app/extensions/array';
// #endregion

// Load theme.
const theme = localStorage.getItem('theme') || '';
document.documentElement.setAttribute('data-theme', theme);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
