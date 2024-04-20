import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
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
    { name: 'Isle', value: '' },
    { name: 'Calm', value: 'peaks' },
    { name: 'Wet', value: 'reef' },
    { name: 'Cold', value: 'cold' },
    { name: 'Sandy', value: 'sandy' },
    { name: 'Dark', value: 'dark' },
  ]

  constructor(
    private readonly _dataService: DataService,
    private readonly _settingService: SettingService,
    private readonly _storageService: StorageService
  ) {
    this.unlockedCount = this._dataService.itemConfig.items.filter(x => x.unlocked && !x.autoUnlocked).length;
    this.dateFormats = DateHelper.displayFormats;
    this.dateFormat = DateHelper.displayFormat;
    this.wikiNewTab = _settingService.wikiNewTab;
    this.currentTheme = localStorage.getItem('theme') || '';
  }

  export(): void {
    const unlocked = this._storageService.serializeUnlocked();
    const unlockedCol = this._storageService.serializeUnlockedCol();
    const favourite = this._storageService.serializeFavourites();
    const closet = {
      hidden: JSON.parse(localStorage.getItem('closet.hidden') || '[]'),
    };

    const data = {
      unlocked, unlockedCol, favourite, closet
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

  handleImportJson(data: any): void {
    if (!data) { throw new Error('No content.'); }
    if (typeof data.unlocked !== 'string') { throw new Error('No unlocked data.'); }
    const unlocked = data.unlocked.split(',');
    const unlockedCol = data.unlockedCol?.split(',') || [];

    const unlockedSet = new Set(unlocked);
    const itemCount = this._dataService.itemConfig.items.filter(item => !item.autoUnlocked && unlockedSet.has(item.guid)).length;
    if (!confirm(`You're about to overwrite your current data with ${itemCount} items and some other settings. This cannot be undone. Are you sure?`))
      return;

    this._storageService.unlocked.clear();
    this._storageService.add(...unlocked);
    this._storageService.save();

    this._storageService.unlockedCol.clear();
    this._storageService.addCol(...unlockedCol);
    this._storageService.saveCol();

    if (data.closet) {
      localStorage.setItem('closet.hidden', JSON.stringify(data.closet.hidden));
      localStorage.setItem('closet.sync', '0')
    }

    this._dataService.reloadUnlocked();

    this.unlockedCount = this._dataService.itemConfig.items.filter(x => x.unlocked && !x.autoUnlocked).length;
  }

  clear(): void {
    if (!confirm(`You're about to clear all your data. This cannot be undone. Are you sure?`)) { return; }

    this._storageService.unlocked.clear();
    this._storageService.save();
    this._storageService.unlockedCol.clear();
    this._storageService.saveCol();
    this._storageService.favourites.clear();
    this._storageService.saveFavourites();

    localStorage.setItem('closet.hidden', '[]');

    this._dataService.reloadUnlocked();
    this.unlockedCount = 0;
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
