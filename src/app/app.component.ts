import { Component } from '@angular/core'
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  ready = false;
  dataLoss = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _themeService: ThemeService,
    private readonly _domSanitizer: DomSanitizer,
    private readonly _matIconRegistry: MatIconRegistry,
    private readonly _router: Router
  ) {
    this._dataService.onData.subscribe(() => { this.onData(); });
    this._themeService.init();
    this.initDisplayDate();

    _matIconRegistry.addSvgIconSet(_domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/icons.svg'));

    window.addEventListener('storage', () => {
      this.dataLoss = true;
    });

    dayjs.extend(utc.default);
    dayjs.extend(isoWeek.default);
    dayjs.extend(timezone.default);

    dayjs.tz.setDefault('America/Los_Angeles');

    (window as any).dayjs = dayjs;
  }

  initDisplayDate(): void {
    DateHelper.displayFormat = localStorage.getItem('date.format') || '';
    if (!DateHelper.displayFormat || !DateHelper.displayFormats.includes(DateHelper.displayFormat)) {
      DateHelper.displayFormat = DateHelper.displayFormats[0];
    }
  }

  onData(): void {
    this.ready = true;

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toUpperCase() === 'F') {
        event.preventDefault();
        void this._router.navigate(['/'], { skipLocationChange: true }).then(() => {
          void this._router.navigate(['/search']);
        });
      }
    });
  }
}
