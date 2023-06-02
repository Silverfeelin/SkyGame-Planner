import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, ParamMap, Router } from '@angular/router';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.less']
})
export class ItemsComponent {
  type?: ItemType;

  items!: Array<IItem>;

  columns?: number;

  typeItems: { [key: string]: Array<IItem> } = {};
  typeUnlocked: { [key: string]: number } = {};

  shownItems: Array<IItem> = [];
  shownUnlocked: number = 0;

  showNone = false;
  offsetNone = 0;

  constructor(
    private readonly _dataService: DataService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
    this.initializeItems();
    this.columns = +(localStorage.getItem('item.columns') as string) || undefined;

    _route.queryParamMap.subscribe(params => {
      this.onQueryParamsChanged(params);
    });
  }

  onQueryParamsChanged(query: ParamMap) {
    const type = query.get('type') as ItemType;

    this.type = type as ItemType || ItemType.Outfit;
    this.shownItems = this.typeItems[this.type] ?? [];
    this.shownUnlocked = this.typeUnlocked[this.type] ?? 0;
    this.showNone = this.type === ItemType.Necklace || this.type === ItemType.Hat || this.type === ItemType.Held;
    //this.showNone = false;
    this.offsetNone = this.showNone ? 1 : 0;
  }

  setColumns(): void {
    switch (this.columns) {
      case 3: this.columns = 4; break;
      case 4: this.columns = 5; break;
      case 5: this.columns = undefined; break;
      default:  this.columns = 3; break;
    }

    localStorage.setItem('item.columns', `${this.columns || ''}`);
  }

  selectCategory(type: string) {
    this._router.navigate([], { queryParams: { type }, replaceUrl: true });
  }

  private initializeItems(): void {
    // Clear data.
    this.typeItems = {};
    this.typeUnlocked = {};
    for (const type in ItemType) {
      this.typeItems[type] = [];
      this.typeUnlocked[type] = 0;
    }

    const addItem = (type: string, item: IItem): void => {
      this.typeItems[type].push(item);
      if (item.unlocked) { this.typeUnlocked[type]++; }
    }

    // Load all items. Group subtypes together based on which wardrobe they appear in.
    this.items = this._dataService.itemConfig.items.slice();
    this.items.forEach(item => {
      addItem(item.type, item);

      // Subtypes.
      if (item.type === ItemType.Instrument) { addItem(ItemType.Held, item); }
    });

    // Sort by order.
    for (const type in ItemType) {
      this.typeItems[type].sort((a, b) => a.order! - b.order!);
    }
  }

  openItem(item: IItem): void {
    if (item.nodes?.length) {
      // Find spirit from last appearance of item.
      const tree = NodeHelper.getRoot(item.nodes.at(-1))?.spiritTree;
      const extras: NavigationExtras = { queryParams: { highlightItem: item.guid }};

      const spirit = tree?.spirit ?? tree?.ts?.spirit ?? tree?.visit?.spirit;
      if (tree?.eventInstanceSpirit) {
        void this._router.navigate(['/event-instance', tree.eventInstanceSpirit.eventInstance!.guid], extras);
      } else if (spirit) {
        void this._router.navigate(['/spirit', spirit.guid], extras);
      } else {
        alert('Item source not found.');
      }
    } else if (item.iaps?.length) {
      // Find shop from last appearance of item.
      const shop = item.iaps.at(-1)?.shop;
      if (shop?.permanent) {
        void this._router.navigate(['/shop']);
      } else if (shop?.event) {
        void this._router.navigate(['/event-instance', shop.event.guid]);
      } else if (shop?.season) {
        void this._router.navigate(['/season', shop.season.guid]);
      } else {
        alert('Item source not found.');
      }
    }
  }
}
