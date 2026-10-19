import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, CanDeactivateFn, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { nanoid } from 'nanoid';
import { IItem, ItemType } from 'skygame-data';
import { ItemIconComponent } from '../../icon/item-icon.component';
import { SUBICONS_ALL } from '../../icon/subicons/item-subicons.component';
import { ItemGridLayoutComponent } from '../../grid/item-grid-layout.component';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { DataService } from '@app/services/data.service';
import { ItemCollectionService } from '@app/services/item-collection.service';
import { ItemHelper } from '@app/helpers/item-helper';

const HTTP_URL = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export const canLeaveCollectionEdit: CanDeactivateFn<ItemCollectionEditComponent> = component => component.canLeave();

@Component({
  selector: 'app-item-collection-edit',
  templateUrl: './item-collection-edit.component.html',
  styleUrl: './item-collection-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:beforeunload)': 'onBeforeUnload($event)' },
  imports: [RouterLink, MatIcon, TooltipDirective, ItemIconComponent, ItemGridLayoutComponent, SectionQuickActionsComponent]
})
export class ItemCollectionEditComponent {
  private readonly _dataService = inject(DataService);
  private readonly _collectionService = inject(ItemCollectionService);
  private readonly _router = inject(Router);

  readonly SUBICONS_ALL = SUBICONS_ALL;
  readonly allItems: ReadonlyArray<IItem> = this._dataService.itemConfig.items;
  readonly initialCategory = ItemType.Outfit;

  /** Set when editing an existing collection; copies and new collections get a guid on save. */
  readonly guid?: string;
  readonly notFound = signal(false);

  readonly name = signal('');
  readonly description = signal('');
  readonly imageUrl = signal('');
  readonly items = signal<Array<IItem>>([]);
  readonly itemSet = computed(() => new Set(this.items()));
  readonly imgSrc = computed(() => HTTP_URL.test(this.imageUrl()) ? this.imageUrl() : '');
  readonly imgError = computed(() => !this.imgSrc() && this.imageUrl().length > 0);

  private readonly _initial: string;
  private _saved = false;

  constructor() {
    const route = inject(ActivatedRoute).snapshot;
    this.guid = route.paramMap.get('guid') ?? undefined;
    const sourceGuid = this.guid ?? route.queryParamMap.get('copy');

    if (sourceGuid) {
      const source = this._collectionService.get(sourceGuid);
      if (source) {
        this.name.set(source.name || '');
        this.description.set(source.description || '');
        this.imageUrl.set(source.imageUrl || '');
        this.items.set([...source.items]);
      } else {
        this.notFound.set(true);
      }
    } else {
      const ids = ItemHelper.deserializeQuery(route.queryParamMap.get('items') ?? '');
      this.items.set(ids.map(id => this._dataService.itemIdMap.get(id)).filter((i): i is IItem => !!i));
    }

    this._initial = this._snapshot();
  }

  toggleItem(item: IItem): void {
    this.itemSet().has(item) ? this.removeItem(item) : this.items.update(items => [...items, item]);
  }

  removeItem(item: IItem): void {
    this.items.update(items => items.filter(i => i !== item));
  }

  save(): void {
    const guid = this.guid || nanoid(10);
    this._collectionService.upsert({
      guid,
      name: this.name(),
      description: this.description(),
      imageUrl: this.imgSrc(),
      items: this.items()
    });
    this._saved = true;
    void this._router.navigate(['/item/collection'], { queryParams: { focus: guid } });
  }

  cancel(): void {
    void this._router.navigate(['/item/collection'], { queryParams: this.guid ? { focus: this.guid } : {} });
  }

  canLeave(): boolean {
    return this._saved || !this._isDirty() || confirm('You have unsaved changes to this collection. Discard them?');
  }

  onBeforeUnload(event: Event): void {
    if (!this._saved && this._isDirty()) { event.preventDefault(); }
  }

  private _isDirty(): boolean {
    return !this.notFound() && this._snapshot() !== this._initial;
  }

  private _snapshot(): string {
    return JSON.stringify([this.name(), this.description(), this.imageUrl(), this.items().map(i => i.guid)]);
  }
}
