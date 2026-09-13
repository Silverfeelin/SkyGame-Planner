import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, input, signal } from '@angular/core';
import { DateTime } from 'luxon';
import { DateHelper } from '@app/helpers/date-helper';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClockComponent implements OnInit, OnDestroy {
  readonly label = input.required<string>();
  readonly zone = input<'local' | 'sky'>('local');
  readonly rightAlign = input<boolean>(false);

  readonly time = signal('00:00:00');
  readonly subtle = signal('');

  private _interval?: number;

  ngOnInit(): void {
    this.update();
    this._interval = window.setInterval(() => this.update(), 1000);
  }

  ngOnDestroy(): void {
    if (this._interval) { window.clearInterval(this._interval); }
  }

  private update(): void {
    const local = DateTime.now();
    const now = this.zone() === 'sky' ? local.setZone(DateHelper.skyTimeZone) : local;
    this.time.set(now.toFormat('HH:mm:ss'));

    this.subtle.set(this.zone() === 'sky' ? '' : now.toFormat('cccc · dd LLLL yyyy'));
  }
}
