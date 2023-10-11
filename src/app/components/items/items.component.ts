import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Params, Router, convertToParamMap } from '@angular/router';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem, ItemType } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  previewItems: Array<IItem> = [];
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
    this.shownUnlocked = this.typeUnlocked[this.type] ?? 0;
    this.previewItems = this.shownItems.filter(item => item.previewUrl);

    if (this.type === ItemType.Emote) {
      this.shownItems = Object.values(this.emotes);
      this.shownUnlocked = this.shownItems.filter(item => item.unlocked && item.level === this.emoteLevels[item.name]).length;
    }

    /* Async test
    let shown: Array<IItem> = [];
    let toShow = [...this.shownItems];
    const o = interval(1).subscribe(() => {
      shown.push(...toShow.slice(shown.length, shown.length + 10));
      if (shown.length == toShow.length) { o.unsubscribe(); }
      this.shownItemsAsync.next(shown);
    });
    */

    this.showNone = this.type === ItemType.Necklace || this.type === ItemType.Hat || this.type === ItemType.Held || this.type === ItemType.Shoes || this.type === ItemType.FaceAccessory;
    this.offsetNone = this.showNone ? 1 : 0;

    // Select item from query.
    const itemGuid = query.get('item') || '';
    if (itemGuid) {
      this.selectedItem = this._dataService.guidMap.get(itemGuid) as IItem;
      this.selectedItemNav = this.selectedItem ? NavigationHelper.getItemSource(this.selectedItem) : undefined;
    }

    // Toggle field guide from query.
    this.showFieldGuide = query.get('fg') === '1';
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
    const queryParams = NavigationHelper.getQueryParams(location.href);
    queryParams['type'] = type;
    this.selectedItem ? queryParams['item'] = this.selectedItem.guid : delete queryParams['item'];

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  togglePreviews(): void {
    this.showFieldGuide = !this.showFieldGuide;

    const url = new URL(location.href);
    url.searchParams.set('fg', this.showFieldGuide ? '1' : '0');
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
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
    // Double click, open item.
    if (event.detail > 1) {
      this.openItem(item);
      return;
    }

    // Update current URL to match selection.
    const url = new URL(location.href);
    url.searchParams.set('type', `${this.type}`);
    url.searchParams.set('item', item.guid);
    window.history.replaceState(window.history.state, '', url.pathname + url.search);

    // Select item
    this.onQueryParamsChanged(convertToParamMap(NavigationHelper.getQueryParams(url)));

    // Scroll to item if out of view.
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
