import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CardComponent, CardFoldEvent } from '@app/components/layout/card/card.component';
import { ItemClickEvent, ItemsComponent } from "../items.component";
import { IItem, ItemType } from '@app/interfaces/item.interface';
import { ItemIconComponent } from "../item-icon/item-icon.component";
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { StorageService } from '@app/services/storage.service';
import { NgTemplateOutlet } from '@angular/common';
import { Maybe } from '@app/types/maybe';
import { DataService } from '@app/services/data.service';
import { nanoid } from 'nanoid';
import { ItemTypeSelectorComponent } from "../item-type-selector/item-type-selector.component";

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
  standalone: true,
  imports: [MatIcon, NgbTooltip, NgTemplateOutlet, CardComponent, ItemsComponent, ItemIconComponent, ItemTypeSelectorComponent],
  templateUrl: './item-collection.component.html',
  styleUrl: './item-collection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemCollectionComponent {
  showAdd = false;
  addImgSrc?: string;
  addImgError?: boolean;
  addItemType: ItemType = ItemType.Outfit;
  addItems: Array<IItem> = [];
  addItemSet = new Set<IItem>();

  collections: Array<IItemCollection> = [];
  visibleCollections: { [guid: string]: boolean } = {};

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event): void {
    if (this.addItems.length > 0) { event.preventDefault(); }
  }

  @ViewChild('inpAddName', { static: true }) inpAddName?: ElementRef<HTMLInputElement>;
  @ViewChild('inpAddDescription', { static: true }) inpAddDescription?: ElementRef<HTMLInputElement>;
  @ViewChild('inpAddImage', { static: true }) inpAddImage?: ElementRef<HTMLInputElement>;

  constructor(
    private readonly _storageService: StorageService,
    private readonly _dataService: DataService,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {
    this.loadStorage();
  }

  onBeforeFoldAdd(evt: CardFoldEvent): void {
    this.showAdd = !evt.fold;
    evt.prevent();
  }

  onItemClickedAdd(evt: ItemClickEvent): void {
    this.addItemSet.has(evt.item) ? this.removeItem(evt.item) : this.addItem(evt.item);
  }

  addItem(item: IItem): void {
    this.addItemSet.add(item);
    this.addItems.push(item);
  }

  removeItem(item: IItem): void {
    this.addItemSet.delete(item);
    this.addItems = Array.from(this.addItemSet);
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
    this.addImgSrc = regexHttp.test(value) ? value : '';
    this.addImgError = !this.addImgSrc && value.length > 0;
  }

  showImageLinkInfo(): void {
    alert('It is recommended to use a reputable image host. For example, you can copy the link of a Discord image or upload your image to a service like Imgur.');
  }

  addCollection(): void {
    // Create collection
    const collection: IItemCollection = {
      guid: nanoid(10),
      name: this.inpAddName?.nativeElement?.value || '',
      description: this.inpAddDescription?.nativeElement?.value || '',
      imageUrl: this.addImgSrc || '',
      items: this.addItems
    };
    this.collections.push(collection);
    this.saveStorage();

    // Clear data.
    this.addItems = [];
    this.addItemSet.clear();
    if (this.inpAddName?.nativeElement) { this.inpAddName.nativeElement.value = ''; }
    if (this.inpAddDescription?.nativeElement) { this.inpAddDescription.nativeElement.value = ''; }
    if (this.inpAddImage?.nativeElement) { this.inpAddImage.nativeElement.value = ''; }
    this.updateImgAdd('');

    this.showAdd = false;
  }

  copyCollection(collection: IItemCollection, evt?: Event): void {
    evt?.preventDefault();
    evt?.stopImmediatePropagation();
    if (this.addItems.length && !confirm('Copying this collection will overwrite your current selection to create a new collection. Continue?')) { return; }
    this.addItems = [...collection.items];
    this.addItemSet = new Set(this.addItems);
    if (this.inpAddName?.nativeElement) { this.inpAddName.nativeElement.value = collection.name; }
    if (this.inpAddDescription?.nativeElement) { this.inpAddDescription.nativeElement.value = collection.description; }
    if (this.inpAddImage?.nativeElement) { this.inpAddImage.nativeElement.value = collection.imageUrl; }
    this.updateImgAdd(collection.imageUrl || '');
    this.showAdd = true;
  }

  promptDelete(collection: IItemCollection, evt?: Event): void {
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
}
