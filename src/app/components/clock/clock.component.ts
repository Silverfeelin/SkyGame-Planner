import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClockComponent implements OnInit, OnDestroy {
  private _interval?: number;

  nowLocal?: DateTime;
  localDegHr = 0;
  localDegMin = 0;
  localDegSec = 0;

  nowSky?: DateTime;
  skyDegHr = 0;
  skyDegMin = 0;
  skyDegSec = 0;

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.updateTime();
    this._interval = window.setInterval(() => {
      this.updateTime();
    }, 250);
  }

  ngOnDestroy(): void {
    if (this._interval) { window.clearInterval(this._interval); }
  }

  private updateTime(): void {
    this.nowLocal = DateTime.now();
    const hour = this.nowLocal.hour;
    const minute = this.nowLocal.minute;
    this.localDegHr = (hour % 12) * 30 + minute * 0.5 + 180;
    this.localDegMin = minute * 6 + 180;
    this.localDegSec = this.nowLocal.second * 6 + 180;

    this.nowSky = this.nowLocal.setZone(DateHelper.skyTimeZone);
    const hourSky = this.nowSky.hour;
    const minuteSky = this.nowSky.minute;
    this.skyDegHr = (hourSky % 12) * 30 + minuteSky * 0.5 + 180;
    this.skyDegMin = minuteSky * 6 + 180;
    this.skyDegSec = this.nowSky.second * 6 + 180;

    this._changeDetectorRef.markForCheck();
  }
}
