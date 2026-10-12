import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { ItemIconComponent } from '../icon/item-icon.component';
import { SUBICONS_ALL } from '../icon/subicons/item-subicons.component';
import { DataService } from '@app/services/data.service';
import { SettingService } from '@app/services/setting.service';
import { ItemGridLayoutComponent } from './item-grid-layout.component';
import { ItemPanelComponent } from '../panel/item-panel.component';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { IItem } from 'skygame-data';
import { TooltipDirective } from '@app/directives/tooltip.directive';

/** The panel only has room beside the grid on wide screens. */
const PANEL_QUERY = '(min-width: 1280px)';
const PANEL_PARAM = 'item';

@Component({
  selector: 'app-item-grid',
  templateUrl: './item-grid.component.html',
  styleUrl: './item-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, ItemIconComponent, ItemGridLayoutComponent, ItemPanelComponent, SectionQuickActionsComponent]
})
export class ItemGridComponent {
  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly items: ReadonlyArray<IItem>;

  readonly shownItems = signal<ReadonlyArray<IItem>>([]);

  private readonly _router = inject(Router);
  private readonly _breakpointObserver = inject(BreakpointObserver);
  private readonly _panelEnabled = inject(SettingService).itemPanel;

  private readonly _panelGuid = signal(inject(ActivatedRoute).snapshot.queryParamMap.get(PANEL_PARAM) ?? undefined);
  private readonly _wide = toSignal(this._breakpointObserver.observe(PANEL_QUERY).pipe(map(state => state.matches)),
    { initialValue: this._breakpointObserver.isMatched(PANEL_QUERY) });

  /** The categories stay on top while the panel can be used, so opening it doesn't move the grid around. */
  readonly panelLayout = computed(() => this._panelEnabled && this._wide());

  /**
   * The item from the parameter while it's among the shown items, otherwise the first one shown.
   * The parameter is kept either way, so switching back to its category or widening the window brings it back.
   */
  readonly selected = computed(() => {
    if (!this.panelLayout()) { return undefined; }
    const shown = this.shownItems();
    const guid = this._panelGuid();
    return shown.find(item => item.guid === guid) ?? shown[0];
  });

  private readonly _panel = viewChild(ItemPanelComponent);

  constructor(dataService: DataService) {
    this.items = dataService.itemConfig.items;
  }

  /** Tiles are real links, so modified clicks still open the item page in a new tab or window. */
  openItem(event: MouseEvent, item: IItem): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) { return; }
    event.preventDefault();

    if (this.panelLayout()) {
      this.selectItem(item);
      this._panel()?.focus();
    } else {
      this._router.navigate(['/item', item.guid]);
    }
  }

  selectItem(item: IItem): void {
    this._panelGuid.set(item.guid);

    // Written outside the router, like the grid layout's own parameters, so the router doesn't drop those.
    const url = new URL(location.href);
    url.searchParams.set(PANEL_PARAM, item.guid);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }
}
