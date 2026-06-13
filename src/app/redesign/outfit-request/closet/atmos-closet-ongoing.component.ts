import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { SpiritTypeIconComponent } from '@app/components/spirit-type-icon/spirit-type-icon.component';
import { CardComponent } from '@app/components/layout/card/card.component';
import { DataService } from '@app/services/data.service';
import { DateHelper, PeriodState } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { ClosetStateService } from './closet-state.service';
import { IItem, ItemType, ITravelingSpirit, IEventInstance, ISpecialVisit } from 'skygame-data';
import { ISpecialVisitSpirit } from 'skygame-data/dist/interfaces/special-visit-spirit.interface';

@Component({
  selector: 'atmos-closet-ongoing',
  templateUrl: './atmos-closet-ongoing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ItemIconComponent, SpiritTypeIconComponent, CardComponent]
})
export class AtmosClosetOngoingComponent {
  readonly state = inject(ClosetStateService);
  private readonly _data = inject(DataService);

  readonly itemToggled = output<IItem>();

  readonly itemTypes: ItemType[] = [
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
    ItemType.Cape, ItemType.Held, ItemType.Furniture, ItemType.Prop
  ];
  readonly itemTypeOrder: Record<string, number>;

  ts?: ITravelingSpirit;
  tsState?: PeriodState;
  tsItems?: IItem[];

  rs?: ISpecialVisit;
  rsSpirits: Array<{ returning: ISpecialVisitSpirit; items: IItem[] }> = [];

  events: Array<{ instance: IEventInstance; items: IItem[]; iapItems: IItem[] }> = [];

  constructor() {
    this.itemTypeOrder = this.itemTypes.reduce((m, t, i) => (m[t] = i, m), {} as Record<string, number>);
    this._initTs();
    this._initRs();
    this._initEvents();
  }

  private _initTs(): void {
    const ts = this._data.travelingSpiritConfig.items.at(-1);
    if (!ts) { return; }
    const state = DateHelper.getStateFromPeriod(ts.date, ts.endDate);
    if (state === 'ended') { return; }
    this.ts = ts;
    this.tsState = state;
    const types = new Set<ItemType>(this.itemTypes);
    const items = TreeHelper.getItems(ts.tree).filter(i => types.has(i.type));
    items.sort((a, b) => this.itemTypeOrder[a.type] - this.itemTypeOrder[b.type]);
    this.tsItems = items;
  }

  private _initRs(): void {
    const rs = this._data.returningSpiritsConfig.items.at(-1);
    if (!rs) { return; }
    const state = DateHelper.getStateFromPeriod(rs.date, rs.endDate);
    if (state !== 'active') { return; }
    this.rs = rs;
    const types = new Set<ItemType>(this.itemTypes);
    this.rs.spirits?.forEach(spirit => {
      const items = TreeHelper.getItems(spirit.tree).filter(i => types.has(i.type));
      items.sort((a, b) => this.itemTypeOrder[a.type] - this.itemTypeOrder[b.type]);
      this.rsSpirits.push({ returning: spirit, items });
    });
  }

  private _initEvents(): void {
    const types = new Set<ItemType>(this.itemTypes);
    const instances = this._data.eventConfig.items
      .map(e => e.instances?.at(-1))
      .filter(i => i && DateHelper.isActive(i.date, i.endDate));
    instances.forEach(instance => {
      if (!instance) { return; }
      const spirits = instance.spirits || [];
      const items = spirits.map(s => TreeHelper.getItems(s.tree)).flat().filter(i => types.has(i.type));
      const shops = instance.shops || [];
      const listItems = shops.map(s => s.itemList?.items || []).flat();
      const iapItems = shops.map(s => (s.iaps || []).map(a => a.items || [])).flat().flat();
      items.push(...listItems.filter(i => types.has(i.item.type)).map(i => i.item));
      items.sort((a, b) => this.itemTypeOrder[a.type] - this.itemTypeOrder[b.type]);
      iapItems.sort((a, b) => this.itemTypeOrder[a.type] - this.itemTypeOrder[b.type]);
      this.events.push({ instance, items, iapItems });
    });
  }
}
