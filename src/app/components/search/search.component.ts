import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SubscriptionLike, debounceTime, fromEvent } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { ISearchItem, SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements AfterViewInit, OnDestroy {
  @ViewChild('input') input: ElementRef<HTMLInputElement> | undefined;

  demoText = 'Gratitude';
  searchResults?: Array<ISearchItem<unknown>>;
  searchSubscription?: SubscriptionLike;
  resetSubscription?: SubscriptionLike;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _searchService: SearchService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router
  ) {
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
    const results = this._searchService.search(value, {});
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

  unsubscribe(): void {
    this.searchSubscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
