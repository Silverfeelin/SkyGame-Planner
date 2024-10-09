import { ChangeDetectionStrategy, Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SubscriptionLike } from 'rxjs';
import { ImageService } from 'src/app/services/image.service';
import { MatIcon } from '@angular/material/icon';
import { IconService } from '@app/services/icon.service';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
    styleUrls: ['./icon.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ MatIcon]
})
export class IconComponent implements OnChanges {
  @Input() src?: string;

  @HostBinding('style.opacity')
  @Input() opacity?: number;

  @Input() width?: string;
  @Input() height?: string;
  @Input() verticalAlign?: string;

  @Input() lazy?: boolean;
  @Input() draggable?: boolean;

  safeString?: string;
  isSvg = false;
  isStoryBlok = false;

  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;

  _loadSource?: SubscriptionLike

  constructor(
    private readonly _imageService: ImageService,
    private readonly _iconService: IconService,
    private readonly _domSanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] || changes['width'] || changes['height']) {
      this.updateImage();
    }
  }

  updateImage(): void {
    let src = this.src;
    // Ignore stale data
    if (this._loadSource) {
      this._loadSource.unsubscribe();
      this._loadSource = undefined;
    }

    this.safeString = undefined;
    this.backgroundImage = undefined;
    this.backgroundPosition = undefined;
    this.backgroundSize = undefined;

    src ||= '';
    this.isSvg = src.startsWith('#');
    this.isStoryBlok = src.includes('storyblok.com');

    if (this.isSvg) {
      this.safeString = src.startsWith('#') ? src.substring(1) : src;
    } else {
      const mappedIcon = this._iconService.getIcon(src);
      if (mappedIcon) {
        this.backgroundImage = `url(${mappedIcon.url})`;
        const baseSize = 128;
        const width = parseInt(this.width || '64', 10);
        const height = parseInt(this.height || '64', 10);

        const scaleX = width / baseSize;
        const scaleY = height / baseSize;

        this.backgroundPosition = `-${mappedIcon.x * scaleX}px -${mappedIcon.y * scaleY}px`;
        this.backgroundSize = `${2048 * scaleX}px ${2048 * scaleY}px`;
      } else {
        this.safeString = src;
      }
    }
  }
}
