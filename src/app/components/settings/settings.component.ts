import { ChangeDetectorRef, Component, effect, OnDestroy, signal } from '@angular/core';
import { DataService, ITrackables } from 'src/app/services/data.service';
import { DateHelper } from 'src/app/helpers/date-helper';
import { SettingService } from 'src/app/services/setting.service';
import { DateTime } from 'luxon';
import { StorageService } from 'src/app/services/storage.service';
import { IStorageExport } from 'src/app/services/storage/storage-provider.interface';
import { DateTimePipe } from '../../pipes/date-time.pipe';
import { NgFor, LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ITheme, setTheme, themes } from 'src/themes';
import { CardComponent } from "../layout/card/card.component";

interface IExport {
  version: string;
  storageData: IStorageExport;
  closetData: {
    hidden: Array<string>;
  };
}

const signalPwa = signal<any>(undefined);

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.less'],
    imports: [MatIcon, RouterLink, NgFor, LowerCasePipe, DateTimePipe, CardComponent]
})
export class SettingsComponent implements OnDestroy {
  storageProviderName: string;
  unlockConnectedNodes: boolean;
  today = DateTime.now();
  dateFormat: string;
  dateFormats: Array<string>;
  currentTheme: string;
  themes = themes;
  wikiNewTab = false;
  debugVisible = false;

  pwaInstallPrompt?: any = (window as any).pwaInstallPrompt;

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService,
    private readonly _settingService: SettingService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.storageProviderName = this._storageService.getProviderName();
    this.dateFormats = DateHelper.displayFormats;
    this.dateFormat = DateHelper.displayFormat;
    this.wikiNewTab = _settingService.wikiNewTab;
    this.debugVisible = _settingService.debugVisible;
    this.currentTheme = localStorage.getItem('theme') || '';
    this.unlockConnectedNodes = _storageService.getKey('tree.unlock-connected') !== '0';

    addEventListener('beforeinstallprompt', this.beforeInstallPrompt);

    effect(() => {
      this.pwaInstallPrompt ??= signalPwa();
      _changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    removeEventListener('beforeinstallprompt', this.beforeInstallPrompt);
  }

  beforeInstallPrompt(evt: Event): void {
    evt.preventDefault();
    (window as any).pwaInstallPrompt = evt;
    signalPwa.set(evt);
  }

  async promptPwa(): Promise<void> {
    if (!this.pwaInstallPrompt) { return; }
    const result = await this.pwaInstallPrompt.prompt();
    console.log(result);
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

    // Support old format.
    if (typeof (data as any).unlocked === 'string') {
      const d = data as any;
      data = {
        version: '0.1.1',
        storageData: {
          date: '2024-04-01T00:00:00.000+00:00',
          currencies: { candles: 0, hearts: 0, ascendedCandles: 0, giftPasses: 0, eventCurrencies: {}, seasonCurrencies: {} },
          unlocked: d.unlocked,
          wingedLights: d.wingedLights,
          favourites: d.favourites,
          seasonPasses: '',
          gifted: '',
          mapMarkers: '',
          keys: {}
        },
        closetData: d.closet
      };
    }

    this._storageService.import(data.storageData || {});

    if (data.closetData) {
      localStorage.setItem('closet.hidden', JSON.stringify(data.closetData.hidden));
      localStorage.setItem('closet.sync', '0')
    }

    const trackables: ITrackables = {
      unlocked: this._storageService.getUnlocked(),
      wingedLights: this._storageService.getWingedLights(),
      favourites: this._storageService.getFavourites(),
      gifted: this._storageService.getGifted()
    };

    this._dataService.refreshUnlocked(trackables);
  }

  export(): void {
    const data: IExport = {
      version: '1.1.0',
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
      currencies: { candles: 0, hearts: 0, ascendedCandles: 0, giftPasses: 0, eventCurrencies: {}, seasonCurrencies: {} },
      unlocked: '',
      wingedLights: '',
      favourites: '',
      seasonPasses: '',
      gifted: '',
      mapMarkers: '',
      keys: {}
    });

    localStorage.setItem('closet.hidden', '[]');

    this._dataService.refreshUnlocked({
      unlocked: new Set(),
      wingedLights: new Set(),
      favourites: new Set(),
      gifted: new Set()
    });
  }

  toggleConnectedNodes(): void {
    this.unlockConnectedNodes = !this.unlockConnectedNodes;
    this._storageService.setKey('tree.unlock-connected', this.unlockConnectedNodes ? '1' : '0');
  }

  setDateFormat(format: string): void {
    this.dateFormat = format;
    DateHelper.displayFormat = format;
    localStorage.setItem('date.format', format);
  }

  setTheme(theme: ITheme): void {
    this.currentTheme = theme.value;
    setTheme(theme);
  }

  toggleWikiTab(): void {
    this.wikiNewTab = !this.wikiNewTab;
    this._settingService.wikiNewTab = this.wikiNewTab;
  }

  viewKeyboardShortcuts(): void {
    const event = new KeyboardEvent('keydown', { key: '?', ctrlKey: true, shiftKey: true });
    document.dispatchEvent(event);
  }

  toggleDebugInfo(): void {
    this.debugVisible = !this.debugVisible;
    this._settingService.debugVisible = this.debugVisible;
  }
}
