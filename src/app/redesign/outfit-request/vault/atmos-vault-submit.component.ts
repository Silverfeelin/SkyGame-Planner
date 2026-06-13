import {
  ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { IItem, ItemType } from 'skygame-data';
import { IApiOutfit } from './vault-api.service';
import { ItemSelection } from './atmos-vault-item-picker.component';

@Component({
  selector: 'atmos-vault-submit',
  templateUrl: './atmos-vault-submit.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent, FormsModule, ItemTypePipe]
})
export class AtmosVaultSubmitComponent implements OnInit {
  readonly selection = input<ItemSelection>({});
  readonly nonItems = input<{ [id: number]: IItem }>({});
  readonly submitted = output<IApiOutfit>();

  readonly requiredParams: { [key in ItemType]?: string } = {
    [ItemType.Outfit]: 'outfitId', [ItemType.Mask]: 'maskId',
    [ItemType.Hair]: 'hairId', [ItemType.Cape]: 'capeId'
  };

  readonly selectionTypes: Array<ItemType> = [
    ItemType.Outfit, ItemType.Mask, ItemType.Hair, ItemType.Cape,
    ItemType.Shoes, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Prop
  ];

  readonly itemIcons: { [key: string]: string } = {
    ['Outfit']: 'outfit', ['Shoes']: 'shoes', ['OutfitShoes']: 'outfit-shoes',
    ['Mask']: 'mask', ['FaceAccessory']: 'face-acc', ['Necklace']: 'necklace',
    ['Hair']: 'hair', ['HairAccessory']: 'hair-acc', ['HeadAccessory']: 'head-acc',
    ['Cape']: 'cape', ['Held']: 'held', ['Furniture']: 'shelf', ['Prop']: 'cup'
  };

  readonly sizes = ['Unknown size', 'Chibi', 'Tiny spell', 'Below average', 'Average', 'Above average', 'Tall', 'Huge spell'];
  readonly lightings = ['Unknown lighting', 'Day', 'Sunset', 'Night', 'Forest'];

  readonly linkRegex = /^https:\/\/discord\.com\/(channels\/575762611111592007\/\d{1,32}\/\d{1,32})$/;
  readonly isWindows = navigator.platform?.toLowerCase().includes('win') || navigator.userAgent?.includes('Windows');

  submitUnderstood = signal(false);
  hasRequiredItems = signal(false);
  discordLinkValid = signal(false);
  sDiscordLink = signal('');
  pDiscordLink = signal('');
  sSize = signal(localStorage.getItem('outfit-vault-size') ?? '0');
  sLight = signal(localStorage.getItem('outfit-vault-light') ?? '0');

  ngOnInit(): void {
    this.hasRequiredItems.set(
      Object.keys(this.requiredParams).every(type => !!this.selection()[type as ItemType])
    );
    this.sDiscordLink.set('');
    this.pDiscordLink.set('');
    this.discordLinkValid.set(false);
  }

  onDiscordLinkChange(value: string): void {
    this.sDiscordLink.set(value);
    const match = this.linkRegex.exec(value);
    this.discordLinkValid.set(!!match);
    this.pDiscordLink.set(this.isWindows && match ? `discord://-/${match[1]}` : '');
  }

  onSubmit(): void {
    const link = this.sDiscordLink();
    const match = this.linkRegex.exec(link);
    if (!match) {
      alert('Please enter a valid Discord link. Only links to messages in the official Sky Discord are allowed.');
      return;
    }

    const sel = this.selection();
    const ni = this.nonItems();

    if (!confirm('Is all information you entered correct?')) { return; }

    const model: IApiOutfit = {
      link,
      outfitId: sel[ItemType.Outfit]?.id || 0,
      maskId: sel[ItemType.Mask]?.id || 0,
      hairId: sel[ItemType.Hair]?.id || 0,
      capeId: sel[ItemType.Cape]?.id || 0,
      shoesId: sel[ItemType.Shoes]?.id,
      faceAccessoryId: sel[ItemType.FaceAccessory]?.id,
      necklaceId: sel[ItemType.Necklace]?.id,
      hairAccessoryId: sel[ItemType.HairAccessory]?.id,
      headAccessoryId: sel[ItemType.HeadAccessory]?.id,
      propId: sel[ItemType.Prop]?.id,
      lightingId: +this.sLight() || 0,
      sizeId: +this.sSize() || 0
    };

    // Remove empty/nonItem selections
    for (const key of Object.keys(model)) {
      const val = model[key as keyof IApiOutfit] as number;
      if (typeof val === 'number' && ni[val]) {
        delete model[key as keyof IApiOutfit];
      }
    }

    if (!model.outfitId || !model.maskId || !model.hairId || !model.capeId) {
      alert('This outfit is incomplete. An outfit requires at least an outfit, mask, hairstyle and cape.');
      return;
    }

    localStorage.setItem('outfit-vault-size', this.sSize());
    localStorage.setItem('outfit-vault-light', this.sLight());

    this.submitted.emit(model);
  }
}
