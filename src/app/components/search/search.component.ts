import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import fuzzysort from 'fuzzysort';
import { DataService } from 'src/app/services/data.service';

interface ISearchItem {
  name: string;
  type: string;
  data: any;
  search: string | Fuzzysort.Prepared;
  highlightedName?: string;
}

const items: Array<ISearchItem> = [];

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.less']
})
export class SearchComponent implements AfterViewInit {
  @ViewChild('input') input: ElementRef<HTMLInputElement> | undefined;

  searchResults: Array<ISearchItem> = [];

  constructor(
    private readonly _dataService: DataService
  ) {
    if (!items.length) {
      this.init();
    }
  }

  init(): void {
    items.push(...this._dataService.itemConfig.items.filter(item => {
      if (item.type === 'Spell' || item.type === 'Quest' || item.type === 'Special') { return; }
      if (item.type === 'Emote' && item.level! > 1) { return; }
      return true;
    }).map(item => {
      return { name: item.name, type: 'Item', data: item, search: item.name }
    }));

    items.push(...this._dataService.spiritConfig.items.filter(spirit => {
      return spirit.type !== 'Special';
    }).map(spirit => {
      return { name: spirit.name, type: 'Spirit', data: spirit, search: spirit.name }
    }));

    items.forEach(item => {
      if (typeof(item.search) !== 'string') { return; }
      item.search = fuzzysort.prepare(item.search);
    });
  }

  ngAfterViewInit(): void {
    this.input?.nativeElement.focus();
  }

  search(): void {
    const value = this.input?.nativeElement.value || '';
    if (!value) {
      this.searchResults = [];
      return;
    }

    const results = fuzzysort.go(value, items, { key: 'search', limit: 25 });
    this.searchResults = results.map(result => {
      result.obj.highlightedName = fuzzysort.highlight(result, '<b>', '</b>') ?? '';
      return result.obj;
    });
  }
}
