import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { LowerCasePipe, TitleCasePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { DYE_COLORS, DyeColor, IDye } from '@app/interfaces/dye.interface';
import { ItemDyeVersion, ItemDyeVersionService } from '@app/services/item-dye-version.service';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { TooltipDirective } from '@app/directives/tooltip.directive';

@Component({
  selector: 'app-item-dye-versions',
  templateUrl: './item-dye-versions.component.html',
  styleUrl: './item-dye-versions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, LowerCasePipe, TitleCasePipe, ItemTypePipe, TooltipDirective]
})
export class ItemDyeVersionsComponent {
  readonly DYE_COLORS = DYE_COLORS;
  readonly CUSTOM_VERSIONS = [1, 2] as const;
  readonly DYE_ROWS = [
    { type: 'primary', label: 'Main color' },
    { type: 'secondary', label: 'Blend color' }
  ] as const;

  private readonly _dyeVersionService = inject(ItemDyeVersionService);

  readonly item = input.required<IItem>();

  /** 0 is the default version, 1 and 2 are the custom versions. */
  readonly selected = signal<0 | 1 | 2>(1);

  readonly slots = computed(() => this.item().dye?.secondary ? ['Primary', 'Secondary'] : ['Primary']);
  readonly versions = computed(() => this._dyeVersionService.get(this.item().guid));
  readonly selectedVersion = computed(() => {
    const selected = this.selected();
    return selected ? this.versions()[selected - 1] : undefined;
  });

  /** Splits a circle between the main dye of each slot; a slot without a main dye shows its blend dye. */
  versionSwatch(version: ItemDyeVersion | undefined): string | undefined {
    if (!version) { return undefined; }
    const colors = this.slots().map((_, i) => version[i]?.primary ?? version[i]?.secondary);
    if (!colors.some(c => c)) { return undefined; }
    const [top, bottom = top] = colors.map(c => c ? `var(--atmos-dye-${c})` : 'var(--atmos-bg-elev-3)');
    return `linear-gradient(to bottom, ${top} 0 60%, ${bottom} 60% 100%)`;
  }

  selectDye(slot: number, type: keyof IDye, color: DyeColor | undefined): void {
    const selected = this.selected();
    if (!selected) { return; }

    const current = this.selectedVersion();
    const version: ItemDyeVersion = [{ ...current?.[0] }, { ...current?.[1] }];
    version[slot][type] = color;

    const isDyed = version.some(d => d.primary || d.secondary);
    this._dyeVersionService.set(this.item().guid, selected === 1 ? 0 : 1, isDyed ? version : undefined);
  }
}
