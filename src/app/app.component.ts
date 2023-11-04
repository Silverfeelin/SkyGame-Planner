import { Component, ViewContainerRef } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from './services/data.service';
import { ThemeService } from './services/theme.service';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as timezone from 'dayjs/plugin/timezone';
import { DateHelper } from './helpers/date-helper';
import { EventService } from './services/event.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  ready = false;
  dataLoss = false;
  showMenu = true;
  hideMoved = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _themeService: ThemeService,
    private readonly _domSanitizer: DomSanitizer,
    private readonly _matIconRegistry: MatIconRegistry,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _router: Router
  ) {
    this._dataService.onData.subscribe(() => { this.onData(); });
    this._themeService.init();
    this.initDisplayDate();

    _matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    _matIconRegistry.addSvgIconSet(_domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icons.svg'));

    window.addEventListener('storage', () => {
      this.dataLoss = true;
    });

    dayjs.extend(utc.default);
    dayjs.extend(isoWeek.default);
    dayjs.extend(timezone.default);
    dayjs.tz.setDefault(DateHelper.skyTimeZone);

    if (location.pathname.endsWith('/outfit-request/request')) {
      this.hideMenu();
    }

    (window as any).dayjs = dayjs;
  }

  closeMoved(): void{
    this.hideMoved = true;
  }

  initDisplayDate(): void {
    DateHelper.displayFormat = localStorage.getItem('date.format') || '';
    if (!DateHelper.displayFormat || !DateHelper.displayFormats.includes(DateHelper.displayFormat)) {
      DateHelper.displayFormat = DateHelper.displayFormats[0];
    }
  }

  onData(): void {
    this.ready = true;
  }

  hideMenu(): void {
    this.showMenu = false;
    document.body.classList.add('menu-hidden');
  }

  export(event: Event): boolean {

    const unlocked = this._storageService.serializeUnlocked();
    const unlockedCol = this._storageService.serializeUnlockedCol();
    const data = {
      unlocked, unlockedCol
    };
    const jsonData = JSON.stringify(data);

    let url = '';
    try {
      const blob = new Blob([jsonData], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkyPlanner_${dayjs().format('YYYY-MM-DD')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      URL.revokeObjectURL(url);
    }
    return false;
  }
}
