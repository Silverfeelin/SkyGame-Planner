import { Injectable, signal } from '@angular/core';
import enTranslations from '@assets/i18n/en.json';
import viTranslations from '@assets/i18n/vi.json';

export type Language = 'en' | 'vi';

export type Translations = typeof enTranslations;

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly _currentLanguage = signal<Language>('en');
  readonly currentLanguage = this._currentLanguage;

  private _translations: Record<Language, Translations> = {
    en: enTranslations as Translations,
    vi: viTranslations as Translations
  };

  constructor() {
    const savedLang = localStorage.getItem('setting.language');
    if (savedLang) {
      try {
        this._currentLanguage.set(savedLang as Language);
      } catch (e) {
        // keep default 'en'
      }
    }
  }

  setLanguage(lang: Language): void {
    this._currentLanguage.set(lang);
    localStorage.setItem('setting.language', lang);
  }

  get(key: keyof Translations): Translations[keyof Translations] {
    return this._translations[this.currentLanguage()][key];
  }

  getNested<T>(path: string): T | string {
    const parts = path.split('.');
    let current: unknown = this._translations[this.currentLanguage()];
    for (const part of parts) {
      if (typeof current === 'object' && current !== null && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return path;
      }
    }
    return current as T;
  }
}
