import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { ItemHelper } from '@app/helpers/item-helper';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { EventService } from '@app/services/event.service';
import { ThatSkyCollectionService } from '@app/services/that-sky-collection.service';
import { ClosetStateService, CopyImageMode, RequestColor } from './closet-state.service';
import { ClosetItemInfoDirective } from './closet-item-info.directive';
import { getTscFitQuery, ITscFitQuery } from './closet-tsc';
import { ClosetExternalLinkService } from './closet-external-link.service';
import { ClosetExternalLinkDirective } from './closet-external-link.directive';
import { ClosetLeaveDialogComponent } from './closet-leave-dialog.component';

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

const TSC_DELAY_MS = 1500;

interface ITscFit {
  loading: boolean;
  count: number;
  link: string | null;
  /** Shown next to the count: which part of the fit was matched. */
  note?: string;
  unknown: Set<string>;
}

const TSC_LOADING: ITscFit = { loading: true, count: 0, link: null, unknown: new Set() };

/** Lists the picked items per marker colour, so a request can be reviewed without searching the grid for borders. */
@Component({
  selector: 'app-closet-selection',
  templateUrl: './closet-selection.component.html',
  styleUrl: './closet-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [ClosetExternalLinkService],
  imports: [MatIcon, ItemIconComponent, ItemTypePipe, ClosetItemInfoDirective, TooltipDirective, ClosetExternalLinkDirective, ClosetLeaveDialogComponent]
})
export class ClosetSelectionComponent {
  readonly state = inject(ClosetStateService);
  private readonly _tsc = inject(ThatSkyCollectionService);
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

  /** Only the red fit is looked up, the request's own. */
  readonly tscQuery = computed(() => getTscFitQuery(this.state.selectedR()),
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) });

  private readonly _tscLoading = signal(false);
  /** The first lookup goes out straight away; later selection changes wait for the user to settle. */
  private _tscCalled = false;
  private readonly _tscFailed = signal(false);
  /** Bumped when the service cache fills, which signals can't see. */
  private readonly _tscVersion = signal(0);

  readonly tscFit = computed(() => {
    this._tscVersion();
    const query = this.tscQuery();
    if (!query || this._tscFailed()) { return undefined; }
    return this._getTscFit(query, this._tscLoading());
  });

  constructor() {
    inject(EventService).clicked.pipe(takeUntilDestroyed()).subscribe(event => {
      if (!this.showMenu()) { return; }
      const menu = this._elementRef.nativeElement.querySelector('.closet-selection__menu');
      if (!menu?.contains(event.target as Node)) { this.showMenu.set(false); }
    });

    effect(onCleanup => {
      const query = this.tscQuery();
      if (!query) { return; }

      const lists = [query.exact, query.outfit, query.cape];
      this._tscFailed.set(false);
      if (lists.every(l => this._tsc.get(l))) {
        this._tscLoading.set(false);
        return;
      }
      if (!this._tsc.isAvailable()) {
        this._tscFailed.set(true);
        return;
      }

      this._tscLoading.set(true);
      const controller = new AbortController();
      const timeout = setTimeout(async () => {
        let ok: boolean;
        try {
          ok = await this._tsc.fetchCounts(lists, controller.signal);
        } catch {
          return;
        }
        this._tscFailed.set(!ok);
        this._tscLoading.set(false);
        this._tscVersion.update(v => v + 1);
      }, this._tscCalled ? TSC_DELAY_MS : 0);
      this._tscCalled = true;

      onCleanup(() => {
        clearTimeout(timeout);
        controller.abort();
      });
    });
  }

  private _getTscFit(query: ITscFitQuery, loading: boolean): ITscFit | undefined {
    const exact = this._tsc.get(query.exact);
    if (!exact) { return loading ? TSC_LOADING : undefined; }

    const unknown = new Set(exact.unknown);
    if (exact.count) { return { loading: false, count: exact.count, link: exact.link, unknown }; }

    for (const [list, note] of [[query.outfit, 'with outfit'], [query.cape, 'with cape']] as const) {
      const single = this._tsc.get(list);
      if (!single) { return loading ? TSC_LOADING : undefined; }
      if (single.count) { return { loading: false, count: single.count, link: single.link, note, unknown }; }
    }
    return { loading: false, count: 0, link: null, unknown };
  }
}
