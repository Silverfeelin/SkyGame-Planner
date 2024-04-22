import { Component, ViewContainerRef } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from './services/data.service';
import { Router } from '@angular/router';
import { DateHelper } from './helpers/date-helper';
import { EventService } from './services/event.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  dataLoss = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _domSanitizer: DomSanitizer,
    private readonly _matIconRegistry: MatIconRegistry,
    private readonly _viewContainerRef: ViewContainerRef,
    private readonly _router: Router
  ) {
    this.initDisplayDate();
    _matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    _matIconRegistry.addSvgIconSet(_domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icons.svg'));

    // _storageService.storageChanged.pipe(filter(e => e.key === 'date.format')).subscribe(() => {
    //   this.initDisplayDate();
    // });

    // _storageService.storageChanged.pipe(filter(e => e.key !== null && storageReloadKeys.has(e.key))).subscribe(() => {
    //   this.dataLoss = true;
    // });

    (window as any).DateTime = DateTime;
  }

  initDisplayDate(): void {
    DateHelper.displayFormat = localStorage.getItem('date.format') || '';
    if (!DateHelper.displayFormat || !DateHelper.displayFormats.includes(DateHelper.displayFormat)) {
      DateHelper.displayFormat = DateHelper.displayFormats[0];
    }
  }
}
