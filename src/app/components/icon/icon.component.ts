import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SubscriptionLike } from 'rxjs';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.less']
})
export class IconComponent implements OnChanges {
  @Input() src?: string;

  @HostBinding('style.opacity')
  @Input() opacity?: number;

  safeString?: string;
  safeUrl?: SafeUrl;
  isSvg = false;

  _loadSource?: SubscriptionLike

  constructor(
    private readonly _imageService: ImageService,
    private readonly _domSanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.updateImage(changes['src'].currentValue);
    }
  }

  updateImage(src?: string): void {
    // Ignore stale data
    if (this._loadSource) {
      this._loadSource.unsubscribe();
      this._loadSource = undefined;
    }

    src ||= '';
    this.isSvg = src.startsWith('#');
    this.safeString = this.safeUrl = undefined;

    if (this.isSvg) {
      this.safeString = src.startsWith('#') ? src.substring(1) : src;
    } else {
      const shouldBlob = false; // src.startsWith('https://static.wikia.nocookie.net/');
      this.safeString = shouldBlob ? undefined : src;
      shouldBlob && this.loadObjectUrl(src);
    }
  }

  loadObjectUrl(src: string): void {
    this._loadSource = this._imageService.get(src).subscribe({
      next: url => this.safeUrl = this._domSanitizer.bypassSecurityTrustUrl(url),
      error: e => console.error('Failed loading URL', src, e)
    });
  }
}