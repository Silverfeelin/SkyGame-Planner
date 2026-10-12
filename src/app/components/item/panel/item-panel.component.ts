import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, input, output, untracked, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { ItemSummaryComponent } from '../summary/item-summary.component';
import { ItemDyeVersionsComponent } from '../dye-versions/item-dye-versions.component';

/**
 * Item details in a side panel beside a list of items, so the list can be browsed without leaving it.
 */
@Component({
  selector: 'app-item-panel',
  templateUrl: './item-panel.component.html',
  styleUrl: './item-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, TooltipDirective, ItemSummaryComponent, ItemDyeVersionsComponent]
})
export class ItemPanelComponent {
  readonly item = input.required<IItem>();
  /** The items the panel steps through, in display order. */
  readonly items = input.required<ReadonlyArray<IItem>>();

  readonly itemSelected = output<IItem>();

  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  private readonly _index = computed(() => this.items().indexOf(this.item()));
  readonly previous = computed<IItem | undefined>(() => this.items()[this._index() - 1]);
  readonly next = computed<IItem | undefined>(() => this.items()[this._index() + 1]);

  constructor() {
    // Stepping to another item starts at its name, not halfway down the previous one.
    effect(() => {
      this.item();
      untracked(() => {
        const body = this.body()?.nativeElement;
        if (body) { body.scrollTop = 0; }
      });
    });
  }

  /** Lets the arrow keys step through items, e.g. right after a tile is clicked. */
  focus(): void {
    this.body()?.nativeElement.focus({ preventScroll: true });
  }

  select(item: IItem | undefined): void {
    if (item) { this.itemSelected.emit(item); }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) { return; }
    // Image overlays opened from the summary are nested dialogs with keys of their own.
    if ((event.target as Element).closest('dialog')) { return; }

    const target = event.key === 'ArrowLeft' ? this.previous()
      : event.key === 'ArrowRight' ? this.next()
      : undefined;
    if (!target) { return; }
    event.preventDefault();
    this.select(target);
  }
}
