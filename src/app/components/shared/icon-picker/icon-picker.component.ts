import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, AfterViewInit, output, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { ISearchItem, SearchService } from '@app/services/search.service';
import { IItem } from 'skygame-data';
import { SUBICONS_NONE } from '@app/components/item/icon/subicons/item-subicons.component';

/** Item-icon search overlay. Emits the picked item, or closes. */
@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrl: './icon-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent]
})
export class IconPickerComponent implements AfterViewInit {
  readonly SUBICONS_NONE = SUBICONS_NONE;
  readonly closed = output<void>();
  readonly selected = output<IItem>();

  private readonly _input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly _searchService = inject(SearchService);

  readonly results = signal<ReadonlyArray<ISearchItem<IItem>>>([]);

  private _lastSearchText = '';

  ngAfterViewInit(): void {
    this.focus();
  }

  focus(): void {
    setTimeout(() => this._input().nativeElement.focus());
  }

  search(): void {
    const text = this._input().nativeElement.value;
    if (text === this._lastSearchText) { return; }
    this._lastSearchText = text;
    this.results.set(this._searchService.searchItems(text, { limit: 15, hasIcon: true }));
  }

  selectSearch(): void {
    this._input().nativeElement.select();
  }

  select(item: IItem): void {
    this.selected.emit(item);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') { this.close(event); }
  }

  close(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.closed.emit();
  }
}
