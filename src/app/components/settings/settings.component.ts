import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import moment from 'moment';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent {
  unlockedCount: number;

  constructor(
    private readonly _storageService: StorageService,
    private readonly _themeService: ThemeService
  ) {
    this.unlockedCount = this._storageService.unlocked.size;
  }

  export(): void {
    const unlocked = this._storageService.serializeUnlocked();
    const data = {
      unlocked
    };
    const jsonData = JSON.stringify(data);

    let url = '';
    try {
      const blob = new Blob([jsonData], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkyPlanner_${moment().format('YYYY-MM-DD')}.json`;
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

    if (!confirm(`You're about to overwrite your current data with ${unlocked.length} entries. This cannot be undone. Are you sure?`))
      return;

    this._storageService.unlocked.clear();
    this._storageService.add(...unlocked);
    this._storageService.save();
    this.unlockedCount = this._storageService.unlocked.size;
  }

  clear(): void {
    if (!confirm(`You're about to clear all your data. This cannot be undone. Are you sure?`))
      return;

    this._storageService.unlocked.clear();
    this._storageService.save();
    this.unlockedCount = 0;
  }

  setTheme(theme?: string): void {
    this._themeService.set(theme);
  }
}
