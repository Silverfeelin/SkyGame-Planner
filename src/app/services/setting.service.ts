import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  readonly settingChanged = new Subject<void>();

  _wikiNewTab = false;
  _debugVisible = false;

  constructor() {
    this._wikiNewTab = localStorage.getItem('wiki.newtab') !== '0';
    this._debugVisible = localStorage.getItem('debug.visible') === '1';
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
}
