import { Component, ViewContainerRef } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from './services/data.service';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as timezone from 'dayjs/plugin/timezone';
import { DateHelper } from './helpers/date-helper';
import { EventService } from './services/event.service';
import { StorageService, storageReloadKeys } from './services/storage.service';
import { filter, take } from 'rxjs';
import { DropboxService } from './services/dropbox.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  ready = false;
  dataLoss = false;
  showMenu = true;
  showDropbox = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _dropboxService: DropboxService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _domSanitizer: DomSanitizer,
    private readonly _matIconRegistry: MatIconRegistry,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _router: Router
  ) {
    this._dataService.onData.subscribe(() => { this.onData(); });
    this.initDisplayDate();
    this.initDropbox();

    _matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    _matIconRegistry.addSvgIconSet(_domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icons.svg'));

    _storageService.storageChanged.pipe(filter(e => e.key === 'date.format')).subscribe(() => {
      this.initDisplayDate();
    });

    _storageService.storageChanged.pipe(filter(e => e.key !== null && storageReloadKeys.has(e.key))).subscribe(() => {
      this.dataLoss = true;
    });

    dayjs.extend(utc.default);
    dayjs.extend(isoWeek.default);
    dayjs.extend(timezone.default);
    dayjs.tz.setDefault(DateHelper.skyTimeZone);
    (window as any).dayjs = dayjs;

    if (location.pathname.endsWith('/outfit-request/request')) {
      this.hideMenu();
    }
  }

  initDisplayDate(): void {
    DateHelper.displayFormat = localStorage.getItem('date.format') || '';
    if (!DateHelper.displayFormat || !DateHelper.displayFormats.includes(DateHelper.displayFormat)) {
      DateHelper.displayFormat = DateHelper.displayFormats[0];
    }
  }

  initDropbox(): void {
    this.showDropbox = this._dropboxService.hasTokens();
    this._dropboxService.authChanged.subscribe(authenticated => {
      this.showDropbox ||= authenticated;
    });
    this._dropboxService.authRemoved.subscribe(() => {
      this.showDropbox = false;
    });
  }

  onData(): void {
    this.ready = true;
  }

  hideMenu(): void {
    this.showMenu = false;
    document.body.classList.add('menu-hidden');
  }
}
