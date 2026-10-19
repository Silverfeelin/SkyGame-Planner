import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ItemIconComponent } from '../icon/item-icon.component';
import { SUBICONS_ALL } from '../icon/subicons/item-subicons.component';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { ItemHelper } from '@app/helpers/item-helper';
import { nanoid } from 'nanoid';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { GoalService } from '@app/services/goal.service';
import { IItemCollection, ItemCollectionService } from '@app/services/item-collection.service';

@Component({
  selector: 'app-item-collection',
  templateUrl: './item-collection.component.html',
  styleUrl: './item-collection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, RouterLink, MatIcon, ItemIconComponent, SectionQuickActionsComponent]
})
export class ItemCollectionComponent {
  readonly SUBICONS_ALL = SUBICONS_ALL;

  focusGuid?: string;

  collections: Array<IItemCollection> = [];

  constructor(
    private readonly _collectionService: ItemCollectionService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _router: Router,
    private readonly _goalService: GoalService
  ) {
    this.collections = this._collectionService.load();
    this.redirectItemsFromUrl();
    this.readFocusFromUrl();
  }

  importCollectionFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || !target.files.length) { return; }
      const file = target.files[0];
      const json = await file.text();
      try {
        const collections: Array<IItemCollection> = this._collectionService.deserialize(json);
        if (!collections.length) { throw new Error('No collections found in file.'); }
        if (!confirm(`You're trying to import ${collections.length} new collection${collections.length === 1 ? '' : 's'}. Continue?`)) { return; }
        collections.forEach(c => {
          c.guid = nanoid(10);
          this.collections.push(c);
        });

        this.saveStorage();
        this._changeDetectorRef.markForCheck();
      } catch {
        alert('Failed to import collection. Please ensure the file is a valid collection.');
      }
    };
    input.click();
  }

  moveCollectionUp(i: number, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    if (i <= 0) { return; }
    const collection = this.collections[i];
    this.collections[i] = this.collections[i - 1];
    this.collections[i - 1] = collection;
    this.saveStorage();
  }

  moveCollectionDown(i: number, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    if (i >= this.collections.length - 1) { return; }
    const collection = this.collections[i];
    this.collections[i] = this.collections[i + 1];
    this.collections[i + 1] = collection;
    this.saveStorage();
  }

  gotoCalculator(collection: IItemCollection, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    const ids = ItemHelper.serializeQuery(collection.items);
    void this._router.navigate(['/item/unlock-calculator'], { queryParams: { items: ids } });
  }

  exportCollection(collection: IItemCollection, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    const data = this._collectionService.serialize([collection]);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sky-planner-collection.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  promptDeleteCollection(collection: IItemCollection, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    if (!confirm(`Are you sure you want to delete the collection "${collection.name}"?`)) { return; }
    this.collections = this.collections.filter(c => c !== collection);
    this.saveStorage();
  }

  collectionUnlockedCount(collection: IItemCollection): number {
    return collection.items.filter(i => i.unlocked).length;
  }

  collectionNeedsGoals(collection: IItemCollection): boolean {
    return collection.items.some(i => !i.unlocked && !this._goalService.has(i.guid));
  }

  planAsGoals(collection: IItemCollection, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    const guids = collection.items.filter(i => !i.unlocked).map(i => i.guid);
    this._goalService.add(...guids);
    void this._router.navigate(['/item/goals']);
  }

  /** Older links create a collection from `?items=` on this page. */
  private redirectItemsFromUrl(): void {
    const items = new URL(location.href).searchParams.get('items');
    if (!items) { return; }
    void this._router.navigate(['/item/collection/add'], { queryParams: { items }, replaceUrl: true });
  }

  private readFocusFromUrl(): void {
    const guid = new URL(location.href).searchParams.get('focus');
    if (!guid || !this.collections.some(c => c.guid === guid)) { return; }
    this.focusGuid = guid;

    // Wait for the list to render before it can be scrolled to.
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-collection="${guid}"]`);
      el?.scrollIntoView({ behavior: 'instant', block: 'center' });
      el?.focus({ preventScroll: true });
    });
  }

  private saveStorage(): void {
    this._collectionService.save(this.collections);
  }
}
