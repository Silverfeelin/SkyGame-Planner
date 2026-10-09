import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LowerCasePipe, TitleCasePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { DYE_COLORS, DyeColor, IDye } from '@app/interfaces/dye.interface';
import { ItemDyeVersion, ItemDyeVersionService } from '@app/services/item-dye-version.service';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { ImageOverlayComponent } from '@app/components/layout/image-overlay/image-overlay.component';
import { versionSwatch } from './dye-swatches';

@Component({
  selector: 'app-item-dye-versions',
  templateUrl: './item-dye-versions.component.html',
  styleUrl: './item-dye-versions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, LowerCasePipe, TitleCasePipe, ItemTypePipe, TooltipDirective, ImageOverlayComponent]
})
export class ItemDyeVersionsComponent {
  readonly DYE_COLORS = DYE_COLORS;
  readonly CUSTOM_VERSIONS = [1, 2] as const;
  readonly DYE_ROWS = [
    { type: 'primary', label: 'Main color', requiresMain: false },
    { type: 'secondary', label: 'Blend color', requiresMain: true }
  ] as const;

  private readonly _dyeVersionService = inject(ItemDyeVersionService);

  readonly item = input.required<IItem>();

  /** 0 is the default version, 1 and 2 are the custom versions. */
  readonly selected = signal<0 | 1 | 2>(1);
  readonly previewImage = signal<'preview' | 'info' | undefined>(undefined);

  readonly slots = computed(() => this.item().dye?.secondary ? ['Primary', 'Secondary'] : ['Primary']);
  readonly versions = computed(() => this._dyeVersionService.get(this.item().guid));
  readonly selectedVersion = computed(() => {
    const selected = this.selected();
    return selected ? this.versions()[selected - 1] : undefined;
  });

  /** Circle background per custom version. */
  readonly swatches = computed(() => {
    const slotCount = this.slots().length;
    return this.versions().map(v => versionSwatch(v, slotCount));
  });

  /** Selection follows the swapped version so the pickers keep showing the same dyes. */
  swapVersions(): void {
    this._dyeVersionService.swap(this.item().guid);
    const selected = this.selected();
    if (selected) { this.selected.set(selected === 1 ? 2 : 1); }
  }

  selectDye(slot: number, type: keyof IDye, color: DyeColor | undefined): void {
    const selected = this.selected();
    if (!selected) { return; }

    const current = this.selectedVersion();
    const version: ItemDyeVersion = [{ ...current?.[0] }, { ...current?.[1] }];
    version[slot][type] = color;
    if (!version[slot].primary) { version[slot].secondary = undefined; }

    const isDyed = version.some(d => d.primary);
    this._dyeVersionService.set(this.item().guid, selected === 1 ? 0 : 1, isDyed ? version : undefined);
  }
}
