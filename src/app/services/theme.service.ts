import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  init(): void {
    const theme = localStorage.getItem('theme') || '';
    this.set(theme);
  }

  set(theme?: string): void {
    if (theme) {
      document.body.dataset['theme'] = theme;
    } else {
      delete document.body.dataset['theme'];
    }

    localStorage.setItem('theme', theme || '');
  }
}
