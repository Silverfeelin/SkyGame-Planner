import { ChangeDetectionStrategy, Component, ElementRef, computed, contentChildren, input, model, viewChildren } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AtmosTabDirective } from './atmos-tab.directive';

let nextId = 0;

/**
 * Atmospheric tab strip. Projects `ng-template[atmosTab]` children as tabs and
 * renders the active one below the nav.
 *
 * `selectedIndex` is a two-way model so the parent can drive or observe the
 * active tab. Panels are all rendered and toggled with `hidden`, so tab state
 * (scroll position, form input) survives switching.
 */
@Component({
  selector: 'app-atmos-tabs',
  templateUrl: './atmos-tabs.component.html',
  styleUrl: './atmos-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet]
})
export class AtmosTabsComponent {
  private readonly _id = nextId++;

  readonly tabs = contentChildren(AtmosTabDirective);
  private readonly _buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  /** Wraps the strip in an `.atmos-card` surface. Disable to embed it in an existing card. */
  readonly card = input<boolean>(true);
  readonly selectedIndex = model<number>(0);

  readonly activeIndex = computed<number>(() => {
    const count = this.tabs().length;
    if (!count) { return -1; }
    return Math.min(Math.max(this.selectedIndex(), 0), count - 1);
  });

  tabId(i: number): string { return `atmos-tab-${this._id}-${i}`; }
  panelId(i: number): string { return `atmos-tabpanel-${this._id}-${i}`; }

  select(i: number): void {
    if (this.tabs()[i]?.disabled()) { return; }
    this.selectedIndex.set(i);
  }

  onKeydown(evt: KeyboardEvent): void {
    const count = this.tabs().length;
    if (!count) { return; }

    let target: number;
    switch (evt.key) {
      case 'ArrowRight': target = this.activeIndex() + 1; break;
      case 'ArrowLeft': target = this.activeIndex() - 1; break;
      case 'Home': target = 0; break;
      case 'End': target = count - 1; break;
      default: return;
    }
    // Stops ancestors and window-level shortcut handlers (e.g. the spirit-tree
    // editor's arrow-key node navigation) from also acting on the key.
    evt.preventDefault();
    evt.stopPropagation();

    // Step over disabled tabs, wrapping around the ends.
    const step = evt.key === 'ArrowLeft' || evt.key === 'End' ? -1 : 1;
    for (let i = 0; i < count; i++) {
      const index = ((target % count) + count) % count;
      if (!this.tabs()[index].disabled()) {
        this.selectedIndex.set(index);
        this._buttons()[index]?.nativeElement.focus();
        return;
      }
      target += step;
    }
  }
}
