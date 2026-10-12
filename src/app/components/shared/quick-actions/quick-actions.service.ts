import { Injectable, signal } from '@angular/core';

/**
 * Expanded state of the collapsible quick-action rows.
 *
 * Shared by every `app-quick-actions` instance so the disclosure survives
 * navigation: a visitor who opens the row to reach another view finds it still
 * open when they land, instead of paying a tap on every page.
 *
 * Only consulted on narrow windows — wider ones always render the full row.
 */
@Injectable({ providedIn: 'root' })
export class QuickActionsService {
  readonly expanded = signal(false);

  toggle(): void {
    this.expanded.update(v => !v);
  }
}
