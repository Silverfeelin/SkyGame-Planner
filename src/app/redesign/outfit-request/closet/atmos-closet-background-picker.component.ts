import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService } from '@app/services/data.service';
import { ClosetStateService } from './closet-state.service';
import { IOutfitRequestBackground, IOutfitRequestBackgrounds } from '@app/interfaces/outfit-request.interface';

@Component({
  selector: 'atmos-closet-background-picker',
  templateUrl: './atmos-closet-background-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: []
})
export class AtmosClosetBackgroundPickerComponent {
  readonly state = inject(ClosetStateService);
  private readonly _data = inject(DataService);

  readonly sections: IOutfitRequestBackgrounds[];
  private readonly _sectionMap: Record<string, IOutfitRequestBackgrounds>;
  private readonly _bgMap: Record<string, IOutfitRequestBackground>;

  constructor() {
    this.sections = Object.values(this._data.outfitRequestConfig.backgrounds);
    this._sectionMap = {};
    this._bgMap = {};
    for (const s of this.sections) {
      this._sectionMap[s.guid] = s;
      for (const bg of s.backgrounds) {
        this._bgMap[bg.guid] = bg;
      }
    }
  }

  select(guid: string): void {
    const bg = this._bgMap[guid];
    const section = this._sectionMap[guid];
    const resolved = bg
      ? bg
      : section
        ? section.backgrounds[Math.floor(Math.random() * section.backgrounds.length)]
        : null;

    if (!resolved) { return; }

    localStorage.setItem('closet.background', guid);
    // Emit the resolved background so the host can update canvas bg
    this.state.showingBackgroundPicker.set(false);
    // Store bg details in state for use by renderer
    (this.state as any)._bgResolved = resolved;
    // Trigger custom event for host to pick up
    document.dispatchEvent(new CustomEvent('atmos-bg-change', { detail: resolved }));
  }
}
