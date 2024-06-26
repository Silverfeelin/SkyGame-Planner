import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WindowHelper } from 'src/app/helpers/window-helper';

@Component({
  selector: 'app-discord-link',
  standalone: true,
  imports: [],
  templateUrl: './discord-link.component.html',
  styleUrl: './discord-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscordLinkComponent implements OnChanges {
  @Input() link?: string;
  @Input() target = '_blank';
  @Input() aClass?: string;
  @Input() aStyle?: string;

  protocolLink?: string;
  hrefLink?: string;

  isWindows = WindowHelper.isWindows();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['link']) { this.updateLink(); }
  }

  private updateLink(): void {
    this.protocolLink = undefined;
    this.hrefLink = undefined;

    const linkRegex = /^https:\/\/discord\.com\/(channels\/.*)$/;
    const match = this.link?.match(linkRegex);
    if (!match) { return; }

    this.protocolLink = `discord://-/${match[1]}`;
    this.hrefLink = this.link;
  }
}
