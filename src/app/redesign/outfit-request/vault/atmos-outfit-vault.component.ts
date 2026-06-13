import {
  ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, signal
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { readFingerprint } from '@app/redesign/outfit-request/closet-fingerprint';
import { IItem, ItemType } from 'skygame-data';
import { VaultApiService, IApiOutfits, IApiOutfit } from './vault-api.service';
import { AtmosVaultItemPickerComponent, ItemSelection } from './atmos-vault-item-picker.component';
import { AtmosVaultResultsComponent, IVaultResult } from './atmos-vault-results.component';
import { AtmosVaultSubmitComponent } from './atmos-vault-submit.component';

export type VaultMode = 'selection' | 'picking' | 'results' | 'submit';

@Component({
  selector: 'app-atmos-outfit-vault',
  templateUrl: './atmos-outfit-vault.component.html',
  styleUrl: './atmos-outfit-vault.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIcon,
    AtmosVaultItemPickerComponent,
    AtmosVaultResultsComponent,
    AtmosVaultSubmitComponent
  ]
})
export class AtmosOutfitVaultComponent implements OnInit {
  @ViewChild(AtmosVaultItemPickerComponent) private _picker?: AtmosVaultItemPickerComponent;

  private readonly _dataService = inject(DataService);
  private readonly _vaultApi = inject(VaultApiService);

  readonly mode = signal<VaultMode>('picking');
  readonly selection = signal<ItemSelection>({});
  readonly resultData = signal<IApiOutfits | undefined>(undefined);
  readonly isFinding = signal(false);
  readonly isSubmitting = signal(false);
  readonly pasting = signal(false);

  readonly requiredParams: { [key in ItemType]?: string } = {
    [ItemType.Outfit]: 'outfitId', [ItemType.Mask]: 'maskId',
    [ItemType.Hair]: 'hairId', [ItemType.Cape]: 'capeId'
  };
  readonly optionalParams: { [key in ItemType]?: string } = {
    [ItemType.Shoes]: 'shoesId', [ItemType.FaceAccessory]: 'faceAccessoryId',
    [ItemType.Necklace]: 'necklaceId', [ItemType.HairAccessory]: 'hairAccessoryId',
    [ItemType.HeadAccessory]: 'headAccessoryId', [ItemType.Prop]: 'propId'
  };

  nonItems: { [id: number]: IItem } = {};

  ngOnInit(): void {
    this.initNonItems();
    this.initSelectionFromUrl();
  }

  onSelectionChange(sel: ItemSelection): void {
    this.selection.set(sel);
  }

  findOutfits(): void {
    const sel = this.selection();
    if (!Object.values(sel).some(s => s && !this.nonItems[s.id!])) {
      alert('Please select some items to search for outfits.');
      return;
    }

    const key = this._vaultApi.ensureKey();
    this.isFinding.set(true);

    const params: Record<string, string> = { key };
    for (const requiredType of Object.keys(this.requiredParams)) {
      const item = sel[requiredType as ItemType];
      if (!item || this.nonItems[item.id!]) { continue; }
      params[this.requiredParams[requiredType as ItemType]!] = `${item.id}`;
    }
    for (const optionalType of Object.keys(this.optionalParams)) {
      const item = sel[optionalType as ItemType];
      if (!item || this.nonItems[item.id!]) { continue; }
      params[this.optionalParams[optionalType as ItemType]!] = `${item.id}`;
    }

    this._vaultApi.getOutfits(params).subscribe({
      next: data => {
        this.resultData.set(data);
        this.mode.set('results');
      },
      error: e => {
        console.error(e);
        alert('Failed to get outfits. Please try again later.');
      }
    }).add(() => {
      this.isFinding.set(false);
    });
  }

  showSubmit(): void {
    this.mode.set('submit');
  }

  showPicking(): void {
    this.mode.set('picking');
  }

  showResults(): void {
    if (this.resultData()) {
      this.mode.set('results');
    }
  }

  onSubmitted(model: IApiOutfit): void {
    if (this.isSubmitting()) { return; }
    const key = this._vaultApi.ensureKey();
    model.key = key;

    this.isSubmitting.set(true);
    this._vaultApi.submitOutfit(model).subscribe({
      next: () => {
        setTimeout(() => {
          alert('Successfully submitted outfit! Thank you for the contribution.');
          this.mode.set('picking');
        }, 50);
      },
      error: e => {
        alert(e.error || 'Something went wrong!');
        console.error(e);
      }
    }).add(() => {
      this.isSubmitting.set(false);
    });
  }

  onDeleteResult(result: IVaultResult): void {
    if (!result.data.id) {
      alert('Outfit has no ID. Please report this if it keeps happening after refreshing!');
      return;
    }
    if (!confirm('Are you sure you want to delete this outfit? This will remove it from the search results for everyone.')) { return; }

    const key = this._vaultApi.key;
    this._vaultApi.deleteOutfit(result.data.id, key).subscribe({
      next: () => {
        const current = this.resultData();
        if (current) {
          this.resultData.set({ items: current.items.filter(i => i.id !== result.data.id) });
        }
        setTimeout(() => { alert('Outfit deleted!'); }, 50);
      },
      error: e => {
        console.error(e);
        alert('Failed to delete outfit.');
      }
    });
  }

  onReportResult(result: IVaultResult): void {
    if (!result.data?.id) { return; }
    prompt(
      'Send this message to Silverfeelin on Discord to report this submission. Please add a brief description why the submission is incorrect!',
      `I'm reporting outfit vault submission: \`${result.data.id}\` with the link: <${result.data.link}>. Reason: `
    );
  }

  paste(event: ClipboardEvent): void {
    const imgUrl = this.getImgUrlFromClipboard(event);
    if (!imgUrl) { return; }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) { return; }

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const itemIds = readFingerprint(ctx, [2, canvas.height - 2]);

      if (this._picker) { this._picker._reset(); }
      const sel: ItemSelection = {};

      const itemTypeOrder = [
        ItemType.Outfit, ItemType.Shoes,
        ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
        ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
        ItemType.Cape, ItemType.Prop
      ];

      itemIds.forEach((id, idx) => {
        if (!id) { return; }
        const item = this._dataService.itemIdMap.get(id);
        if (item && idx < itemTypeOrder.length) {
          sel[itemTypeOrder[idx]] = item;
        }
      });

      this.selection.set(sel);
      this.mode.set('submit');
      this.pasting.set(false);
    };
    img.src = imgUrl;
  }

  private getImgUrlFromClipboard(event: ClipboardEvent): string | undefined {
    if (!event.clipboardData) { return undefined; }
    const items = event.clipboardData.items;
    if (!items) { return undefined; }
    for (let i = 0; i < items.length; i++) {
      if (!items[i].type.includes('image')) { continue; }
      const file = items[i].getAsFile();
      return file ? URL.createObjectURL(file) : undefined;
    }
    return undefined;
  }

  private initNonItems(): void {
    const itemTypeUnequip: { [key: string]: number } = [
      ItemType.Necklace, ItemType.HeadAccessory, ItemType.FaceAccessory,
      ItemType.Held, ItemType.Shoes, ItemType.FaceAccessory
    ].reduce((map, type, i) => (map[`${type}`] = 46655 - i, map), {} as { [key: string]: number });

    for (const [type, id] of Object.entries(itemTypeUnequip)) {
      this.nonItems[id] = {
        id, guid: type.substring(0, 10).padStart(10, '_'),
        name: 'None', icon: 'assets/icons/none.webp',
        type: type as ItemType, unlocked: true, order: -1
      };
    }
  }

  private initSelectionFromUrl(): void {
    const sel: ItemSelection = {};
    const url = new URL(window.location.href);
    const allParams = { ...this.requiredParams, ...this.optionalParams };
    for (const type of Object.keys(allParams)) {
      const q = allParams[type as ItemType]!;
      const id = +url.searchParams.get(q)! || 0;
      if (!id) { continue; }
      let item = this._dataService.itemIdMap.get(id);
      item = item ?? this.nonItems[id];
      if (!item) { continue; }
      sel[type as ItemType] = item;
    }
    if (Object.keys(sel).length) {
      this.selection.set(sel);
    }
  }
}
