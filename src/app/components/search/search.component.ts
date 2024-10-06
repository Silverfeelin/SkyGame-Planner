import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, fromEvent } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { ISearchItem, SearchService, SearchType } from 'src/app/services/search.service';
import { ItemTypePipe } from '../../pipes/item-type.pipe';
import { IconComponent } from '../icon/icon.component';
import { TableColumnDirective } from '../table/table-column/table-column.directive';
import { TableHeaderDirective } from '../table/table-column/table-header.directive';
import { TableComponent } from '../table/table.component';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CardComponent } from '../layout/card/card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SubscriptionBag } from '@app/helpers/subscription-bag';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CardComponent, MatIcon, NgIf, TableComponent, TableHeaderDirective, TableColumnDirective, IconComponent, RouterLink, ItemTypePipe]
})
export class SearchComponent implements AfterViewInit, OnDestroy {
  @Input() types?: Array<SearchType>;
  @Input() emitClick = false;
  @Input() showRefine = true;
  @Input() placeholder = 'Tip: use Ctrl+Shift+F to start a new search at any time.';

  @Output() rowClicked = new EventEmitter<{ event: MouseEvent, row: ISearchItem<unknown> }>();

  @ViewChild('input') input: ElementRef<HTMLInputElement> | undefined;

  demoText = 'Gratitude';
  searchResults?: Array<ISearchItem<unknown>>;

  _subscriptions = new SubscriptionBag();

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _searchService: SearchService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
    // Focus input on search hotkey.
    this._eventService.keydown.pipe(takeUntilDestroyed()).subscribe(evt => {
      if (!evt.ctrlKey || !evt.shiftKey || evt.key.toUpperCase() !== 'F') { return; }
      if (!this.input?.nativeElement) { return; }
      this.input.nativeElement.setSelectionRange(0, this.input.nativeElement.value.length);
      this.input.nativeElement.focus();
    });
  }

  ngAfterViewInit(): void {
    if (!this.input) { return; }

    // Set the input value.
    const search = this._route.snapshot.queryParamMap.get('search');
    if (search) {
      this.input.nativeElement.value = search;
      setTimeout(() => { this.search(); });
    }

    if (this._route.snapshot.queryParamMap.get('focus')) {
      this.input.nativeElement.focus();
    }

    // Update URL for backwards navigation.
    const subscription = fromEvent(this.input.nativeElement, 'input').pipe(debounceTime(250)).subscribe(() => {
      this.updateCurrentRoute();
    });
    this._subscriptions.add(subscription);
  }

  onRowClick(evt: MouseEvent, row: ISearchItem<unknown>): void {
    this.rowClicked.emit({ event: evt, row });
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
    const results = this._searchService.search(value, { types: this.types });
    this.searchResults = results;

    // Show random season as example search.
    if (!wasEmpty && !results.length) {
      const items = this._dataService.seasonConfig.items;
      const item = items[Math.floor(Math.random() * items.length)];
      this.demoText = item.shortName;
    }

    this._changeDetectorRef.markForCheck();
  }

  focusInput(): void {
    this.input?.nativeElement.focus();
    scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }
}
