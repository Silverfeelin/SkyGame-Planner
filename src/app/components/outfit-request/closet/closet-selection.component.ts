import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { ItemHelper } from '@app/helpers/item-helper';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { EventService } from '@app/services/event.service';
import { ClosetStateService, CopyImageMode, RequestColor } from './closet-state.service';
import { ClosetItemInfoDirective } from './closet-item-info.directive';

const COLORS: Array<{ color: RequestColor; label: string }> = [
  { color: 'r', label: 'Red' },
  { color: 'y', label: 'Yellow' },
  { color: 'g', label: 'Green' },
  { color: 'b', label: 'Blue' }
];

const SHARES: Array<{ mode: CopyImageMode; label: string; copyLabel: string; icon: string }> = [
  { mode: 'request', label: 'Share request', copyLabel: 'Copy request image', icon: 'background_grid_small' },
  { mode: 'square', label: 'Share one fit', copyLabel: 'Copy one-fit image', icon: 'grid_on' }
];

/** Lists the picked items per marker colour, so a request can be reviewed without searching the grid for borders. */
@Component({
  selector: 'app-closet-selection',
  templateUrl: './closet-selection.component.html',
  styleUrl: './closet-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon, ItemIconComponent, ItemTypePipe, ClosetItemInfoDirective, TooltipDirective]
})
export class ClosetSelectionComponent {
  readonly state = inject(ClosetStateService);
  private readonly _elementRef = inject(ElementRef<HTMLElement>);

  /** Keeps the bar visible with an empty state when nothing is selected. */
  readonly alwaysShow = input(false);

  readonly removed = output<{ item: IItem; color: RequestColor }>();
  readonly shareRequested = output<CopyImageMode>();
  readonly copyImageRequested = output<{ mode: CopyImageMode; tooltip: TooltipDirective }>();
  readonly copyLinkRequested = output<TooltipDirective>();
  readonly costRequested = output<void>();

  readonly shares = SHARES;
  readonly folded = signal(true);
  readonly showMenu = signal(false);
  /** Which image is being copied, so only its button spins. */
  readonly copying = signal<CopyImageMode | undefined>(undefined);
  readonly count = computed(() => Object.keys(this.state.selectedAll()).length);
  readonly rows = computed(() => COLORS
    .map(c => ({ ...c, items: ItemHelper.sortItems(Object.values(this.state.selections[c.color]())) }))
    .filter(r => r.items.length));

  constructor() {
    inject(EventService).clicked.pipe(takeUntilDestroyed()).subscribe(event => {
      if (!this.showMenu()) { return; }
      const menu = this._elementRef.nativeElement.querySelector('.closet-selection__menu');
      if (!menu?.contains(event.target as Node)) { this.showMenu.set(false); }
    });
  }
}
