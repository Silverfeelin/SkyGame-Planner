import { Component } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DateHelper } from './helpers/date-helper';
import { EventService } from './services/event.service';
import { DateTime } from 'luxon';
import { filter } from 'rxjs';
import { BroadcastService } from './services/broadcast.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  dataLoss = false;
  isPagesDev = location.host.endsWith('.pages.dev');
  pagesRedirectUrl?: URL;

  constructor(
    private readonly _broadcastService: BroadcastService,
    private readonly _eventService: EventService,
    private readonly _domSanitizer: DomSanitizer,
    private readonly _matIconRegistry: MatIconRegistry,
    private readonly _router: Router
  ) {
    this.initDisplayDate();
    _matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    _matIconRegistry.addSvgIconSet(_domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icons.svg'));

    _eventService.storageChanged.pipe(filter(e => e.key === 'date.format')).subscribe(() => {
      this.initDisplayDate();
    });

    _broadcastService.subject.pipe(filter(m => m.type === 'storage.changed')).subscribe(message => {
      this.dataLoss = true;
    });

    if (this.isPagesDev) {
      this.subscribePagesDev();
    }

    (window as any).DateTime = DateTime;
  }

  initDisplayDate(): void {
    DateHelper.displayFormat = localStorage.getItem('date.format') || '';
    if (!DateHelper.displayFormat || !DateHelper.displayFormats.includes(DateHelper.displayFormat)) {
      DateHelper.displayFormat = DateHelper.displayFormats[0];
    }
  }

  private subscribePagesDev(): void {
    this.pagesRedirectUrl = new URL('https://sky-planner.com');
    this._router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      this.pagesRedirectUrl = new URL('https://sky-planner.com');
      this.pagesRedirectUrl.pathname = location.pathname;
    });
  }
}
