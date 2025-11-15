import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SettingService } from 'src/app/services/setting.service';
import { MatIcon } from '@angular/material/icon';
import { IWiki } from 'skygame-data';

@Component({
    selector: 'app-wiki-link',
    templateUrl: './wiki-link.component.html',
    styleUrls: ['./wiki-link.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatIcon]
})
export class WikiLinkComponent {
  @Input() aClass? = 'container d-inline-block';
  @Input() wiki?: IWiki;
  @Input() order?: number;

  openNewTab = false;

  constructor(
    private readonly _settingService: SettingService
  ) {
    this.openNewTab = _settingService.wikiNewTab;
  }
}
