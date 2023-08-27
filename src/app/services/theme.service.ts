import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _theme!: string;

  get theme(): string {
    return this._theme;
  }

  init(): void {
    const theme = localStorage.getItem('theme') || '';
    this.set(theme);
  }

  set(theme?: string): void {
    this._theme = theme || '';

    if (theme) {
      document.body.dataset['theme'] = theme;
    } else {
      delete document.body.dataset['theme'];
    }

    localStorage.setItem('theme', theme || '');
  }
}
