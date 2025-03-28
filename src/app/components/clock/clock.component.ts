import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from 'src/app/helpers/date-helper';
import { DateComponent } from '../util/date/date.component';
import { NgIf } from '@angular/common';
import { getShardInfo, ShardInfo } from '@app/helpers/shard-helper';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-clock',
    templateUrl: './clock.component.html',
    styleUrls: ['./clock.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, DateComponent, NgbTooltip, MatIcon]
})
export class ClockComponent implements OnInit, OnDestroy {
  private _interval?: number;
  private _intervalShard?: number;

  nowLocal?: DateTime;
  localDegHr = 0;
  localDegMin = 0;
  localDegSec = 0;

  nowSky?: DateTime;
  skyDegHr = 0;
  skyDegMin = 0;
  skyDegSec = 0;

  shardType?: 'red' | 'black';
  shardHasLanded = false;
  shardWillLand = false;

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.updateTime();
    this._interval = window.setInterval(() => {
      this.updateTime();
    }, 250);

    this.updateShard();
    this._intervalShard = window.setInterval(() => {
      this.updateShard();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this._interval) { window.clearInterval(this._interval); }
    if (this._intervalShard) { window.clearInterval(this._intervalShard); }
  }

  gotoShard(): void {
    window.open('https://sky-shards.pages.dev/', '_blank');
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

  private updateShard(): void {
    const now = DateTime.now();
    const shardInfo = getShardInfo(now);
    const currentShard = shardInfo.occurrences?.find(occurrence => now >= occurrence.land && now < occurrence.end);
    this.shardHasLanded = shardInfo.hasShard && !!currentShard;
    this.shardWillLand = shardInfo.hasShard && !!shardInfo.occurrences?.find(occurrence => now < occurrence.land);
    this.shardType = shardInfo.isRed ? 'red' : 'black';
  }
}
