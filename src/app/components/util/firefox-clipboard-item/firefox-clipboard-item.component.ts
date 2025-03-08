import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-firefox-clipboard-item',
    templateUrl: './firefox-clipboard-item.component.html',
    styleUrls: ['./firefox-clipboard-item.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf]
})
export class FirefoxClipboardItemComponent {
  hasClipboardItem = typeof(ClipboardItem) !== 'undefined';
}
