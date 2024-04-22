import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DateHelper } from 'src/app/helpers/date-helper';
import { SettingService } from 'src/app/services/setting.service';
import { DateTime } from 'luxon';

interface ITheme {
  name: string;
  value: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent {
  unlockedCount: number;
  today = DateTime.now();
  dateFormat: string;
  dateFormats: Array<string>;
  currentTheme: string;
  wikiNewTab = false;

  themes: Array<ITheme> = [
    { name: 'Isle of Dawn', value: '' },
    { name: 'Aviary Village', value: 'cozy' },
    { name: 'Prairie Peaks', value: 'peaks' },
    { name: 'Treasure Reef', value: 'reef' },
    { name: 'Village of Dreams', value: 'cold' },
    { name: 'Crescent Oasis', value: 'sandy' },
    { name: 'Void', value: 'dark' },
  ]

  constructor(
    private readonly _dataService: DataService,
    private readonly _settingService: SettingService
  ) {
    this.unlockedCount = this._dataService.itemConfig.items.filter(x => x.unlocked && !x.autoUnlocked).length;
    this.dateFormats = DateHelper.displayFormats;
    this.dateFormat = DateHelper.displayFormat;
    this.wikiNewTab = _settingService.wikiNewTab;
    this.currentTheme = localStorage.getItem('theme') || '';
  }

  setDateFormat(format: string): void {
    this.dateFormat = format;
    DateHelper.displayFormat = format;
    localStorage.setItem('date.format', format);
  }

  setTheme(theme: ITheme): void {
    this.currentTheme = theme.value;
    localStorage.setItem('theme', theme.value);
    document.documentElement.setAttribute('data-theme', theme.value);
  }

  setRandomTheme(): void {
    let theme: ITheme;
    do {
      theme = this.themes[Math.floor(Math.random() * this.themes.length)];
    } while (theme.value === this.currentTheme);
    this.setTheme(theme);
  }

  toggleWikiTab(): void {
    this.wikiNewTab = !this.wikiNewTab;
    this._settingService.wikiNewTab = this.wikiNewTab;
  }
}
