import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IItem } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { ISearchItem, SearchService } from '@app/services/search.service';
import { IconComponent } from '@app/components/icon/icon.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';

@Component({
  selector: 'app-atmos-search-bar',
  templateUrl: './atmos-search-bar.component.html',
  styleUrl: './atmos-search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, IconComponent, ItemTypePipe]
})
export class AtmosSearchBarComponent {
  private readonly _searchService = inject(SearchService);
  private readonly _dataService = inject(DataService);
  private readonly _eventService = inject(EventService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  readonly favouriteCount = input<number>(0);

  readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly query = signal('');
  readonly results = signal<ReadonlyArray<ISearchItem<unknown>> | undefined>(undefined);
  readonly demoText = signal('Gratitude');

  private _debounceHandle?: number;

  constructor() {
    this._eventService.keydown.pipe(takeUntilDestroyed()).subscribe(evt => {
      if (!evt.ctrlKey || !evt.shiftKey || evt.key.toUpperCase() !== 'F') { return; }
      this.focusInput();
      evt.preventDefault();
    });

    this._route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(params => {
      const q = params.get('q') ?? '';
      this.query.set(q);
      const el = this.input()?.nativeElement;
      if (el && el.value !== q) { el.value = q; }
      if (q) { this.runSearch(q); } else { this.results.set(undefined); }
    });
  }

  onInput(): void {
    const value = this.input()?.nativeElement.value ?? '';
    this.query.set(value);
    if (this._debounceHandle) { clearTimeout(this._debounceHandle); }
    this._debounceHandle = window.setTimeout(() => this.setQueryParam(value), 120);
  }

  clear(): void {
    this.setQueryParam('');
    this.input()?.nativeElement.focus();
  }

  searchDemo(): void {
    const demo = this.demoText();
    const el = this.input()?.nativeElement;
    if (el) { el.value = demo; }
    this.query.set(demo);
    this.setQueryParam(demo);
    el?.focus();
  }

  private setQueryParam(value: string): void {
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { q: value || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  focusInput(): void {
    const el = this.input()?.nativeElement;
    if (!el) { return; }
    el.setSelectionRange(0, el.value.length);
    el.focus();
  }

  iconSrc(row: ISearchItem<unknown>): string | undefined {
    const d = row.data as { iconUrl?: string; icon?: string; imageUrl?: string } | undefined;
    if (!d) { return undefined; }
    return d.iconUrl || d.icon || d.imageUrl || undefined;
  }

  asItem(row: ISearchItem<unknown>): IItem { return row.data as IItem; }

  private runSearch(value: string): void {
    const wasEmpty = this.results()?.length === 0;
    if (!value) { this.results.set(undefined); return; }

    const r = this._searchService.search(value, { limit: 25 });
    this.results.set(r);

    if (!wasEmpty && !r.length) {
      const items = this._dataService.seasonConfig.items;
      const item = items[Math.floor(Math.random() * items.length)];
      if (item) { this.demoText.set(item.shortName); }
    }
  }
}
