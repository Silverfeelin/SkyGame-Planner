import { AppComponent } from './app/app.component';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';

// #region Extensions
import './app/extensions/array';
import { provideRouter } from '@angular/router';
import { routes } from './app/app-routes';
import { provideServiceWorker } from '@angular/service-worker';
import { isDevMode } from '@angular/core';
import { loadTheme } from './themes';
// #endregion

// Load theme.
loadTheme();

addEventListener('beforeinstallprompt', evt => {
  evt.preventDefault();
  (window as any).pwaInstallPrompt = evt;
});

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
]
}).catch(err => console.error(err));
