import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-firefox-clipboard-item',
  templateUrl: './firefox-clipboard-item.component.html',
  styleUrls: ['./firefox-clipboard-item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirefoxClipboardItemComponent {
  hasClipboardItem = typeof(ClipboardItem) !== 'undefined';
}
