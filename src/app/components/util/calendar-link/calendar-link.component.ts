import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ICalendarFm } from '@app/interfaces/wiki.interface';
import { SettingService } from '@app/services/setting.service';

@Component({
  selector: 'app-calendar-link',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './calendar-link.component.html',
  styleUrl: './calendar-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarLinkComponent {
  @Input() aClass? = 'container d-inline-block';
  @Input() cal?: ICalendarFm;
  @Input() order?: number;

  openNewTab = false;

  constructor(
    private readonly _settingService: SettingService
  ) {
    this.openNewTab = _settingService._wikiNewTab;
  }
}
