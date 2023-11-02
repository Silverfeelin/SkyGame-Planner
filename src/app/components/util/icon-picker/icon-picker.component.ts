import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { IItem } from 'src/app/interfaces/item.interface';
import { ISearchItem, SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconPickerComponent implements AfterViewInit {
  @ViewChild('input', { static: true }) input!: ElementRef<HTMLInputElement>;

  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly selected = new EventEmitter<IItem>();

  searchText?: string;
  _lastSearchText = '';

  searchResults: Array<ISearchItem<IItem>> = [];

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _searchService: SearchService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {

  }

  ngAfterViewInit(): void {
    this.focus();
  }

  search(): void {
    this.searchText = this.input.nativeElement.value;
    if (this.searchText === this._lastSearchText) { return; }
    this._lastSearchText = this.searchText;
    this.searchResults = this._searchService.searchItems(this.searchText, { limit: 15, hasIcon: true });
    this._changeDetectorRef.markForCheck();
  }

  reset(): void {
    this.input.nativeElement.value = '';
    this.searchText = undefined;
    this.searchResults = [];
    this._changeDetectorRef.markForCheck();
  }

  focus():  void {
    setTimeout(() => { this.input.nativeElement.focus(); });
  }

  select(item: IItem): void {
    this.selected.emit(item);
  }

  pickerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close(event);
    }
  }

  close(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.closed.emit();
  }
}
