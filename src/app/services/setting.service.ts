import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  readonly settingChanged = new Subject<void>();

  _wikiNewTab = false;
  _debugVisible = false;
  _dailyCandleAmount = 0;

  constructor() {
    this._wikiNewTab = localStorage.getItem('wiki.newtab') !== '0';
    this._debugVisible = localStorage.getItem('debug.visible') === '1';
    this._dailyCandleAmount = parseInt(localStorage.getItem('setting.daily-candle-amount') || '0', 10) || 0;
  }

  get wikiNewTab(): boolean {
    return this._wikiNewTab;
  }

  set wikiNewTab(value: boolean) {
    this._wikiNewTab = value;
    localStorage.setItem('wiki.newtab', value ? '1': '0');
    this.settingChanged.next();
  }

  get debugVisible(): boolean {
    return this._debugVisible;
  }

  set debugVisible(value: boolean) {
    this._debugVisible = value;
    localStorage.setItem('debug.visible', value ? '1' : '0');
    this.settingChanged.next();
  }

  get dailyCandleAmount(): number {
    return this._dailyCandleAmount;
  }

  set dailyCandleAmount(value: number) {
    this._dailyCandleAmount = Math.max(0, value);
    localStorage.setItem('setting.daily-candle-amount', String(this._dailyCandleAmount));
    this.settingChanged.next();
  }
}
