import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { ClosetStateService } from './closet-state.service';
import { IOutfitRequestBackground, IOutfitRequestBackgrounds } from '@app/interfaces/outfit-request.interface';

@Component({
  selector: 'app-closet-background-picker',
  templateUrl: './closet-background-picker.component.html',
  styleUrl: './closet-background-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon]
})
export class ClosetBackgroundPickerComponent {
  readonly state = inject(ClosetStateService);
  private readonly _data = inject(DataService);

  /** Guid of the picked entry — either a background or a section (random). */
  readonly selected = signal<string | undefined>(localStorage.getItem('closet.background') ?? undefined);
  /** What's in use: the pick, or the default when nothing was picked. */
  readonly current = computed(() => this.selected() ?? this._defaultGuid);

  readonly sections: IOutfitRequestBackgrounds[];
  private readonly _sectionMap: Record<string, IOutfitRequestBackgrounds>;
  private readonly _bgMap: Record<string, IOutfitRequestBackground>;
  private readonly _defaultGuid?: string;

  constructor() {
    this.sections = Object.values(this._data.outfitRequestConfig.backgrounds);
    this._sectionMap = {};
    this._bgMap = {};
    for (const s of this.sections) {
      this._sectionMap[s.guid] = s;
      if (!this._defaultGuid && s.default) { this._defaultGuid = s.guid; }
      for (const bg of s.backgrounds) {
        this._bgMap[bg.guid] = bg;
        if (!this._defaultGuid && bg.default) { this._defaultGuid = bg.guid; }
      }
    }
    this._defaultGuid ??= Object.values(this._bgMap).at(0)?.guid;
  }

  /** Forgets the pick, so a later change of the default applies again. */
  reset(): void {
    if (!this._defaultGuid || !this._apply(this._defaultGuid)) { return; }
    localStorage.removeItem('closet.background');
    this.selected.set(undefined);
  }

  select(guid: string): void {
    if (!this._apply(guid)) { return; }
    localStorage.setItem('closet.background', guid);
    this.selected.set(guid);
  }

  private _apply(guid: string): boolean {
    const bg = this._bgMap[guid];
    const section = this._sectionMap[guid];
    const resolved = bg
      ? bg
      : section
        ? section.backgrounds[Math.floor(Math.random() * section.backgrounds.length)]
        : null;

    if (!resolved) { return false; }

    // Emit the resolved background so the host can update canvas bg
    this.state.showingBackgroundPicker.set(false);
    // Store bg details in state for use by renderer
    (this.state as any)._bgResolved = resolved;
    // Trigger custom event for host to pick up
    document.dispatchEvent(new CustomEvent('atmos-bg-change', { detail: resolved }));
    return true;
  }
}
