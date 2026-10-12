import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SettingService } from '@app/services/setting.service';
import { ICalendarFm } from 'skygame-data';

@Component({
    selector: 'app-calendar-link',
    imports: [MatIcon],
    templateUrl: './calendar-link.component.html',
    styleUrl: './calendar-link.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarLinkComponent {
  @Input() aClass? = '';
  @Input() cal?: ICalendarFm;
  @Input() order?: number;

  openNewTab = false;

  constructor(
    private readonly _settingService: SettingService
  ) {
    this.openNewTab = _settingService.wikiNewTab;
  }
}
