import { ChangeDetectionStrategy, Component, inject, output, input, computed } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { DataService } from '@app/services/data.service';
import { ClosetStateService } from './closet-state.service';
import { ClosetItemInfoDirective } from './closet-item-info.directive';
import { CLOSET_SECTIONS, CLOSET_TYPE_ICONS, groupClosetItems, IClosetGroup } from './closet-groups';
import { getOngoingGroups } from './closet-ongoing';
import { IItem, ItemType } from 'skygame-data';

@Component({
  selector: 'app-closet-grid',
  templateUrl: './closet-grid.component.html',
  styleUrl: './closet-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, MatIcon, ItemIconComponent, IconComponent, ClosetItemInfoDirective]
})
export class ClosetGridComponent {
  readonly state = inject(ClosetStateService);
  private readonly _data = inject(DataService);

  readonly requesting = input(false);
  readonly itemToggled = output<IItem>();
  readonly dyeClicked = output<{ item: IItem; event: MouseEvent }>();

  readonly itemIcons = CLOSET_TYPE_ICONS;

  readonly gridSections = CLOSET_SECTIONS;

  readonly grouping = computed<IClosetGroup[] | undefined>(() => {
    const view = this.state.view();
    if (view === 'type') { return undefined; }
    const filter = this.state.typeFilter();
    const requesting = this.requesting();
    const shown = (item: IItem) => (!filter || item.type === filter) && !this.state.isHiddenFromCloset(item, requesting);
    const source = view === 'results' ? Object.values(this.state.searchResults() ?? {}) : this.state.allItems();
    const groups = groupClosetItems(source.filter(item => item.order !== -1 && shown(item)), view, this._data.realmConfig.items);
    if (view !== 'season' && view !== 'event') { return groups; }

    const ongoing = this._ongoing[view].map(group => {
      const rows = group.rows.map(row => ({ ...row, items: row.items.filter(shown) })).filter(row => row.items.length);
      return { ...group, rows, count: rows.reduce((n, r) => n + r.items.length, 0) };
    }).filter(group => group.count);
    return [...ongoing, ...groups];
  });

  private readonly _ongoing = {
    season: getOngoingGroups(this._data, 'season'),
    event: getOngoingGroups(this._data, 'event')
  };

  toggleSection(type: ItemType): void {
    this.state.typeFolded.update(map => {
      const next = { ...map };
      next[type] ? delete next[type] : (next[type] = true);
      return next;
    });
  }

  isItemHidden(item: IItem): boolean {
    const state = this.state;
    if (state.typeFolded()[item.type]) { return true; }
    return state.isHiddenFromCloset(item, this.requesting());
  }

  isItemFaded(item: IItem): boolean {
    if (this.state.hidden()[item.guid]) { return true; }
    if (!this.requesting() && this.state.modifyingCloset()) { return false; }
    if (this.state.hideIap() && item.iaps?.length) { return true; }
    const avail = this.state.available();
    if (avail && !avail[item.guid]) { return true; }
    return false;
  }

  getItemsForType(type: ItemType): IItem[] {
    return this.state.items()[type as string] ?? [];
  }
}
