import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import fuzzysort from 'fuzzysort';
import { SubscriptionLike, debounceTime, fromEvent } from 'rxjs';
import { NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';

interface ISearchItem {
  name: string;
  type: string;
  data: any;
  search: string | Fuzzysort.Prepared;
  highlightedName?: string;
  route?: Array<any>;
  queryParams?: Params;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements AfterViewInit, OnDestroy {
  @ViewChild('input') input: ElementRef<HTMLInputElement> | undefined;

  static items: Array<ISearchItem> = [];

  demoText = 'Gratitude';
  searchResults?: Array<ISearchItem>;
  searchSubscription?: SubscriptionLike;
  resetSubscription?: SubscriptionLike;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
    // Initialize once
    if (!SearchComponent.items.length) {
      this.initializeItems();
    }
  }

  initializeItems(): void {
    // Add items.
    SearchComponent.items.push(...this._dataService.itemConfig.items.filter(item => {
      if (item.type === 'Spell' || item.type === 'Quest' || item.type === 'Special') { return; }
      if (item.type === 'Emote' && item.level! > 1) { return; }
      return true;
    }).map(item => {
      return { name: item.name, type: 'Item', data: item, search: item.name }
    }));

    // Add spirits.
    SearchComponent.items.push(...this._dataService.spiritConfig.items.filter(spirit => {
      return spirit.type !== 'Special' && spirit.type !== 'Event';
    }).map(spirit => {
      return { name: spirit.name, type: 'Spirit', data: spirit, search: spirit.name }
    }));

    // Add seasons
    SearchComponent.items.push(...this._dataService.seasonConfig.items.map(season => {
      return { name: season.name, type: 'Season', data: season, search: season.name }
    }));

    // Add events
    SearchComponent.items.push(...this._dataService.eventConfig.items.map(event => {
      return { name: event.name, type: 'Event', data: event, search: event.name }
    }));

    // Prepare search strings.
    SearchComponent.items.forEach(item => {
      if (typeof(item.search) !== 'string') { return; }
      item.search = fuzzysort.prepare(item.search);
    });
  }

  ngAfterViewInit(): void {
    if (!this.input) { return; }

    // Focus input on search hotkey.
    this.resetSubscription = this._eventService.searchReset.subscribe(() => {
      if (!this.input?.nativeElement) { return; }
      this.input.nativeElement.setSelectionRange(0, this.input.nativeElement.value.length);
      this.input.nativeElement.focus();
    });

    // Set the input value.
    const search = this._route.snapshot.queryParamMap.get('search');
    if (search) {
      this.input.nativeElement.value = search;
      setTimeout(() => {
        this.search();
      });
    }

    if (this._route.snapshot.queryParamMap.get('focus')) {
      this.input.nativeElement.focus();
    }

    // Update URL for backwards navigation.
    this.searchSubscription = fromEvent(this.input.nativeElement, 'input').pipe(debounceTime(250)).subscribe(() => {
      this.updateCurrentRoute();
    });
  }

  updateCurrentRoute(): void {
    const value = this.input?.nativeElement.value || '';
    let url = window.location.pathname;
    if (value) { url += `?search=${encodeURIComponent(value)}`; }
    window.history.replaceState(window.history.state, '', url);
  }

  searchDemo(evt: Event): void {
    if (!this.input?.nativeElement) { return; }
    this.input.nativeElement.value = (evt.target as HTMLElement).innerText;
    this.search();
    this.updateCurrentRoute();
    this._changeDetectorRef.markForCheck();
  }

  search(): void {
    const wasEmpty = this.searchResults?.length === 0;
    const value = this.input?.nativeElement.value || '';

    // Clear results.
    if (!value) {
      this.searchResults = undefined;
      return;
    }

    // Use fuzzysort to search top 25 results.
    const results = fuzzysort.go(value, SearchComponent.items, { key: 'search', limit: 25 });
    this.searchResults = results.map(result => {
      result.obj.highlightedName = fuzzysort.highlight(result, '<b>', '</b>') ?? '';
      this.setItemLink(result.obj);

      return result.obj;
    });

    // Show random season as example search.
    if (!wasEmpty && !this.searchResults.length) {
      const items = this._dataService.seasonConfig.items;
      const item = items[Math.floor(Math.random() * items.length)];
      this.demoText = item.shortName;
    }

    this._changeDetectorRef.markForCheck();
  }

  setItemLink(item: ISearchItem): void {
    item.route = undefined;
    item.queryParams = undefined;

    switch (item.type) {
      case 'Item':
        const target = NavigationHelper.getItemLink(item.data as IItem);
        item.route = target?.route;
        item.queryParams = target?.extras?.queryParams || undefined;
        break;
      case 'Spirit':
        item.route = ['/spirit', item.data.guid];
        break;
      case 'Season':
        item.route = ['/season', item.data.guid];
        break;
      case 'Event':
        item.route = ['/event', item.data.guid];
        break;
    }
  }

  focusInput(): void {
    this.input?.nativeElement.focus();
    scrollTo(0, 0);
  }

  unsubscribe(): void {
    this.searchSubscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
