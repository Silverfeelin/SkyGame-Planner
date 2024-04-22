import { Component } from '@angular/core';
import { DataService, ITrackables } from 'src/app/services/data.service';
import { DateHelper } from 'src/app/helpers/date-helper';
import { SettingService } from 'src/app/services/setting.service';
import { DateTime } from 'luxon';
import { StorageService } from 'src/app/services/storage.service';
import { IStorageExport } from 'src/app/services/storage/storage-provider.interface';

interface ITheme {
  name: string;
  value: string;
}

interface IExport {
  storageData: IStorageExport;
  closetData: {
    hidden: Array<string>;
  };
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent {
  storageProviderName: string;
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
    private readonly _storageService: StorageService,
    private readonly _settingService: SettingService
  ) {
    this.storageProviderName = this._storageService.getProviderName();
    this.dateFormats = DateHelper.displayFormats;
    this.dateFormat = DateHelper.displayFormat;
    this.wikiNewTab = _settingService.wikiNewTab;
    this.currentTheme = localStorage.getItem('theme') || '';
  }

  import(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) { return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(reader.result as string);
          this.handleImportJson(data);
        } catch (e) {
          console.error(e);
          alert('Failed to parse file. If the selected file was exported by Sky Planner, please report this.');
        }
      };
      reader.onerror = (e) => {
        console.error(e);
        alert('Failed to read file. If the selected file was exported by Sky Planner, please report this.');
      }
      reader.readAsText(file);
    };
    input.click();
  }


  handleImportJson(data: IExport): void {
    if (!data) { throw new Error('No content.'); }
    if (typeof data !== 'object') { throw new Error('Invalid content.'); }
    if (!confirm(`You're about to overwrite your current data. This cannot be undone. Are you sure?`))
      return;

    this._storageService.import(data.storageData || {});

    if (data.closetData) {
      localStorage.setItem('closet.hidden', JSON.stringify(data.closetData.hidden));
      localStorage.setItem('closet.sync', '0')
    }

    const trackables: ITrackables = {
      unlocked: this._storageService.getUnlocked(),
      wingedLights: this._storageService.getWingedLights(),
      favourites: this._storageService.getFavourites()
    };

    this._dataService.refreshUnlocked(trackables);
  }

  export(): void {
    const data: IExport = {
      storageData: this._storageService.export(),
      closetData: {
        hidden: JSON.parse(localStorage.getItem('closet.hidden') || '[]'),
      }
    };

    const jsonData = JSON.stringify(data);
    let url = '';
    try {
      const blob = new Blob([jsonData], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkyPlanner_${DateTime.now().toFormat('yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  clear(): void {
    if (!confirm(`You're about to clear your tracked data. This cannot be undone. Are you sure?`)) { return; }

    this._storageService.import({
      date: DateTime.now().toISO()!,
      unlocked: '',
      wingedLights: '',
      favourites: ''
    });

    localStorage.setItem('closet.hidden', '[]');

    this._dataService.refreshUnlocked({
      unlocked: new Set(),
      wingedLights: new Set(),
      favourites: new Set()
    });
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
