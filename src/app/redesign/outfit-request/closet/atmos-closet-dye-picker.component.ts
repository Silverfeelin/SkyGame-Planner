import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';
import { ClosetStateService, DYE_COLORS, DyeColor } from './closet-state.service';

@Component({
  selector: 'atmos-closet-dye-picker',
  templateUrl: './atmos-closet-dye-picker.component.html',
  styleUrl: './atmos-closet-dye-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon, ItemIconComponent, OverlayComponent]
})
export class AtmosClosetDyePickerComponent {
  readonly state = inject(ClosetStateService);
  readonly closed = output<void>();

  readonly dyeColorList = DYE_COLORS;

  close(): void {
    this.closed.emit();
  }

  selectDye(index: number, type: 'primary' | 'secondary', color: DyeColor | undefined): void {
    const item = this.state.dyeItem();
    if (!item) { return; }

    this.state.dyes.update(d => {
      const next = { ...d };
      if (!next[item.guid]) { next[item.guid] = []; }
      const arr = [...next[item.guid]];
      if (!arr[index]) { arr[index] = {}; }
      arr[index] = { ...arr[index], [type]: color };
      next[item.guid] = arr;
      return next;
    });

    if (type === 'primary') {
      this.state.dyeClasses.update(c => {
        const next = { ...c };
        if (!next[item.guid]) { next[item.guid] = []; }
        const arr = [...(next[item.guid] || [])];
        arr[index] = color ? `dye-${color}` : '';
        next[item.guid] = arr;
        return next;
      });
    }
  }

  getDye(index: number): { primary?: DyeColor; secondary?: DyeColor } {
    const item = this.state.dyeItem();
    if (!item) { return {}; }
    return this.state.dyes()[item.guid]?.[index] || {};
  }

  openPreview(url: string): void {
    window.open(url, '_blank');
  }
}
