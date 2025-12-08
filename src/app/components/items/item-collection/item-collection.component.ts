import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CardComponent, CardFoldEvent } from '@app/components/layout/card/card.component';
import { ItemClickEvent, ItemsComponent } from "../items.component";
import { ItemIconComponent } from "../item-icon/item-icon.component";
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from '@app/services/storage.service';
import { NgTemplateOutlet } from '@angular/common';
import { Maybe } from '@app/types/maybe';
import { DataService } from '@app/services/data.service';
import { nanoid } from 'nanoid';
import { Router } from '@angular/router';
import { ItemHelper } from '@app/helpers/item-helper';
import { IItem, ItemType } from 'skygame-data';

interface IItemCollection {
  guid: string;
  name: string;
  description: string;
  imageUrl: string;
  items: Array<IItem>;
}

interface IStorageData {
  collections: Array<{ guid: string, name: string, description: string, imageUrl?: string, items: string }>;
}

@Component({
    selector: 'app-item-collection',
    imports: [MatIcon, NgbTooltip, NgTemplateOutlet, CardComponent, ItemsComponent, ItemIconComponent],
    templateUrl: './item-collection.component.html',
    styleUrl: './item-collection.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCollectionComponent {
  showEdit = false;
  editImgSrc?: string;
  editImgError?: boolean;
  editItemType: ItemType = ItemType.Outfit;
  editItems: Array<IItem> = [];
  editItemSet = new Set<IItem>();

  editGuid?: string;

  collections: Array<IItemCollection> = [];
  visibleCollections: { [guid: string]: boolean } = {};

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    if (this.editItems.length > 0) { event.preventDefault(); }
  }

  @ViewChild('inpAddName', { static: true }) inpAddName?: ElementRef<HTMLInputElement>;
  @ViewChild('inpAddDescription', { static: true }) inpAddDescription?: ElementRef<HTMLInputElement>;
  @ViewChild('inpAddImage', { static: true }) inpAddImage?: ElementRef<HTMLInputElement>;

  constructor(
    private readonly _storageService: StorageService,
    private readonly _dataService: DataService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _router: Router
  ) {
    this.loadStorage();
    this.readItemsFromUrl();
  }

  private readItemsFromUrl(): void {
    const url = new URL(location.href);
    const sIds = url.searchParams.get('items');
    if (!sIds) { return; }

    this.editItems = [];
    this.editItemSet.clear();
    this.editGuid = undefined;
    this.showEdit = true;
    const ids = ItemHelper.deserializeQuery(sIds);
    for (const id of ids) {
      const item = this._dataService.itemIdMap.get(id);
      if (item) {
        this.addItem(item);
      }
    }
  }

  onBeforeFoldAdd(evt: CardFoldEvent): void {
    this.showEdit = !evt.fold;
    evt.prevent();
  }

  onItemClickedAdd(evt: ItemClickEvent): void {
    this.editItemSet.has(evt.item) ? this.removeItem(evt.item) : this.addItem(evt.item);
  }

  toggleShowAdd(): void {
    if (this.showEdit && this.editGuid) {
      if (!confirm(`You're currently editing a collection. Are you sure you want to reset and add a new collection?`)) { return; }
      this.clearEditForm();
      this.editGuid = undefined;
      return;
    } else if (this.editItems.length) {
      if (!confirm(`You have items selected. Are you sure you want to stop adding a new collection?`)) { return; }
      this.clearEditForm();
    }

    this.clearEditForm();
    this.showEdit = !this.showEdit;
    this.editGuid = undefined;
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
        let collections: Array<IItemCollection> = this.deserializeCollections(json);
        if (!collections.length) { throw new Error('No collections found in file.'); }
        if (!confirm(`You're trying to import ${collections.length} new collection${collections.length === 1 ? '' : 's'}. Continue?`)) { return; }
        collections.forEach(c => {
          c.guid = nanoid(10);
          this.collections.push(c);
        });

        this.saveStorage();
        this._changeDetectorRef.markForCheck();
      } catch (error) {
        alert('Failed to import collection. Please ensure the file is a valid collection.');
      }
    };
    input.click();
  }

  addItem(item: IItem): void {
    this.editItemSet.add(item);
    this.editItems = Array.from(this.editItemSet);
  }

  removeItem(item: IItem): void {
    this.editItemSet.delete(item);
    this.editItems = Array.from(this.editItemSet);
  }

  viewItem(item: IItem): void {
    const url = `${location.origin}/item/${item.guid}`;
    window.open(url, '_blank');
  }

  onInputImgAdd(evt: Event): void {
    const target = evt.target as HTMLInputElement;
    const value = target.value || '';
    this.updateImgAdd(value);
  }

  updateImgAdd(value: string): void {
    const regexHttp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g; // https://stackoverflow.com/a/3809435
    this.editImgSrc = regexHttp.test(value) ? value : '';
    this.editImgError = !this.editImgSrc && value.length > 0;
  }

  showImageLinkInfo(): void {
    alert('It is recommended to use a reputable image host. For example, you can copy the link of a Discord image or upload your image to a service like Imgur.');
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

  saveCollection(): void {
    const collection: IItemCollection = {
      guid: this.editGuid || nanoid(10),
      name: this.inpAddName?.nativeElement?.value || '',
      description: this.inpAddDescription?.nativeElement?.value || '',
      imageUrl: this.editImgSrc || '',
      items: this.editItems
    };

    // Update or create collection.
    if (this.editGuid) {
      const index = this.collections.findIndex(c => c.guid === this.editGuid);
      if (index < 0) {
        alert(`Collection was not found. Please refresh the page. Sorry.`);
        return;
      }
      this.collections[index] = collection;
    } else {
      this.collections.push(collection);
    }

    this.saveStorage();

    // Clear data.
    this.editGuid = undefined;
    this.showEdit = false;
    this.clearEditForm();
  }

  cancelEdit(): void {
    if (!confirm('Are you sure you want to cancel editing this collection?')) { return; }
    this.editGuid = undefined;
    this.showEdit = false;
    this.clearEditForm();
  }

  gotoCalculator(collection: IItemCollection, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    const ids = ItemHelper.serializeQuery(collection.items);
    const queryParams =  { items: ids };
    void this._router.navigate(['/item/unlock-calculator'], { queryParams });
  }

  showEditCollection(collection: IItemCollection, evt?: Event): void {
    this.updateEditForm(collection, evt);
    this.editGuid = collection.guid;
    this.showEdit = true;
  }

  showCopyCollection(collection: IItemCollection, evt?: Event): void {
    this.updateEditForm(collection, evt);
    this.editGuid = undefined;
    this.showEdit = true;
  }

  clearEditForm(): void {
    this.editItems = [];
    this.editItemSet.clear();
    if (this.inpAddName?.nativeElement) { this.inpAddName.nativeElement.value = ''; }
    if (this.inpAddDescription?.nativeElement) { this.inpAddDescription.nativeElement.value = ''; }
    if (this.inpAddImage?.nativeElement) { this.inpAddImage.nativeElement.value = ''; }
    this.updateImgAdd('');
  }

  updateEditForm(collection: IItemCollection, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    if (this.editItems.length && !confirm('Copying this collection will overwrite your current selection to create a new collection. Continue?')) { return; }
    this.editItems = [...collection.items];
    this.editItemSet = new Set(this.editItems);
    if (this.inpAddName?.nativeElement) { this.inpAddName.nativeElement.value = collection.name; }
    if (this.inpAddDescription?.nativeElement) { this.inpAddDescription.nativeElement.value = collection.description; }
    if (this.inpAddImage?.nativeElement) { this.inpAddImage.nativeElement.value = collection.imageUrl; }
    this.updateImgAdd(collection.imageUrl || '');
  }

  exportCollection(collection: IItemCollection, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    const data = this.serializeCollections([collection]);
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

  private loadStorage(): void {
    const data: Maybe<IStorageData> = this._storageService.getKey('item.collections');
    if (data) {
      this.collections = (data.collections || []).map(c => ({
        guid: c.guid, name: c.name, description: c.description, imageUrl: c.imageUrl || '',
        items: c.items?.split(',').map(guid => this._dataService.guidMap.get(guid) as IItem).filter(i => i) || []
      }));
    }
  }

  private saveStorage(): void {
    this._storageService.setKey('item.collections', {
      collections: this.collections.map(c => ({
        guid: c.guid, name: c.name, description: c.description, imageUrl: c.imageUrl,
        items: c.items.map(i => i.guid).join(',')
      }))
    });
  }

  private serializeCollections(collections: Array<IItemCollection>): string {
    return JSON.stringify(collections.map(c => ({
      guid: c.guid,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      items: c.items.map(i => i.guid)
    })), null, 2);
  }

  private deserializeCollections(json: string): Array<IItemCollection> {
    const collections = JSON.parse(json);
    if (!Array.isArray(collections)) { throw new Error('Invalid collection data.'); }
    return collections.map(c => ({
      guid: c.guid,
      name: c.name,
      description: c.description,
      imageUrl: c.imageUrl,
      items: c.items.map((guid: string) => this._dataService.guidMap.get(guid) as IItem).filter((i: IItem) => i)
    }));
  }
}
