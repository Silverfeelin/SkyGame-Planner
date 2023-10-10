import { AfterContentInit, AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router, convertToParamMap } from '@angular/router';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.less']
})
export class ItemsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('itemDiv', { static: true })
  itemDiv!: ElementRef;

  type?: ItemType;
  typeEmote: ItemType = ItemType.Emote;

  items!: Array<IItem>;

  // Item details.
  selectedItem?: IItem;
  selectedItemNav?: INavigationTarget;
  _previewObserver?: IntersectionObserver;
  _scrollToPreview = true;

  columns?: number;

  typeItems: { [key: string]: Array<IItem> } = {};
  typeUnlocked: { [key: string]: number } = {};
  emotes: { [key: string]: IItem } = {};
  emoteLevels: { [key: string]: number } = {};

  shownItems: Array<IItem> = [];
  shownUnlocked: number = 0;

  showFieldGuide = false;
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

  ngAfterViewInit(): void {
    this._previewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        this._scrollToPreview = !entry.isIntersecting || entry.intersectionRatio < 0.5;
      });
    }, { threshold: [0.5] });
    this._previewObserver.observe(this.itemDiv.nativeElement);
  }

  ngOnDestroy(): void {
      this._previewObserver?.disconnect();
  }

  onQueryParamsChanged(query: ParamMap) {
    const type = query.get('type') as ItemType;

    this.type = type as ItemType || ItemType.Outfit;
    this.shownItems = this.typeItems[this.type] ?? [];
    if (this.type === ItemType.Emote) {
      this.shownItems = Object.values(this.emotes);
    }
    this.shownUnlocked = this.typeUnlocked[this.type] ?? 0;
    this.showNone = this.type === ItemType.Necklace || this.type === ItemType.Hat || this.type === ItemType.Held || this.type === ItemType.Shoes || this.type === ItemType.FaceAccessory;
    //this.showNone = false;
    this.offsetNone = this.showNone ? 1 : 0;

    const itemGuid = query.get('item') || '';
    if (itemGuid) {
      this.selectedItem = this._dataService.guidMap.get(itemGuid) as IItem;
      this.selectedItemNav = this.selectedItem ? NavigationHelper.getItemSource(this.selectedItem) : undefined;
    }
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
    this._router.navigate([], { queryParams: { type, item: this.selectedItem?.guid }, replaceUrl: true });
  }

  togglePreviews(): void {
    this.showFieldGuide = !this.showFieldGuide;
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
      if (item.type === 'Emote') {
        // Save highest level emote.
        if (!this.emoteLevels[item.name] || item.level! > this.emoteLevels[item.name]) { this.emoteLevels[item.name] = item.level!; }
        // Save highest unlocked emote.
        if (!this.emotes[item.name] || item.unlocked) {
          this.emotes[item.name] = item;
        }
        return;
      }
      addItem(item.type, item);

      // Subtypes.
      if (item.type === ItemType.Instrument) { addItem(ItemType.Held, item); }
    });

    // Sort by order.
    for (const type in ItemType) {
      this.typeItems[type].sort((a, b) => a.order! - b.order!);
    }
  }

  selectItem(event: MouseEvent, item: IItem): void {
    if (event.detail > 1) {
      this.openItem(item);
      return;
    }

    window.history.replaceState(window.history.state, '', window.location.pathname + `?type=${this.type}&item=${item.guid}`);
    this.onQueryParamsChanged(convertToParamMap({ type: this.type, item: item.guid }));

    if (this._scrollToPreview) {
      setTimeout(() => {
        this.itemDiv.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  openItem(item: IItem): void {
    const route = NavigationHelper.getItemSource(item);
    if (!route) {
      alert('Could not find item source.');
      return;
    }

    this._router.navigate(route.route, route.extras);
  }
}
