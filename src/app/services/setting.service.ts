import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  readonly settingChanged = new Subject<void>();

  _wikiNewTab = false;

  constructor() {
    this._wikiNewTab = this.wikiNewTab;
  }

  get wikiNewTab(): boolean {
    return localStorage.getItem('wiki.newtab') !== '1';
  }

  set wikiNewTab(value: boolean) {
    this._wikiNewTab = value;
    localStorage.setItem('wiki.newtab', value ? '1': '0');
    this.settingChanged.next();
  }
}
