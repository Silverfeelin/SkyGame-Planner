import { Directive, inject, input } from '@angular/core';
import { ClosetExternalLinkService } from './closet-external-link.service';

/** Outbound link that asks before leaving Sky Planner, unless its domain is trusted. */
@Directive({
  selector: 'a[appClosetExternalLink]',
  standalone: true,
  host: {
    '[href]': 'appClosetExternalLink()',
    'target': '_blank',
    'rel': 'noopener',
    '(click)': 'onClick($event)',
    '(auxclick)': 'onClick($event)'
  }
})
export class ClosetExternalLinkDirective {
  readonly appClosetExternalLink = input.required<string>();

  private readonly _links = inject(ClosetExternalLinkService);

  onClick(event: MouseEvent): void {
    if (event.type === 'auxclick' && event.button !== 1) { return; }
    const url = this.appClosetExternalLink();
    if (this._links.isTrusted(url)) { return; }
    event.preventDefault();
    this._links.open(url);
  }
}
