import { ChangeDetectionStrategy, Component, inject, output, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ClosetStateService, RequestColor } from './closet-state.service';
import { SearchService } from '@app/services/search.service';
import { IItem } from 'skygame-data';

@Component({
  selector: 'atmos-closet-toolbar',
  templateUrl: './atmos-closet-toolbar.component.html',
  styleUrl: './atmos-closet-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon]
})
export class AtmosClosetToolbarComponent {
  readonly state = inject(ClosetStateService);
  private readonly _search = inject(SearchService);

  readonly isRequesting = input(false);

  readonly resetRequest = output<void>();
  readonly randomRequest = output<void>();
  readonly copyLinkRequest = output<void>();
  readonly copyImageRequest = output<string>();
  readonly shareImageRequest = output<string>();
  readonly calculateCostRequest = output<void>();
  readonly startTourRequest = output<void>();

  search(text: string): void {
    if (!text || text.length < 3) {
      this.state.searchResults.set(undefined);
      return;
    }
    const results = this._search.searchItems(text, { limit: 100, hasIcon: true });
    const map = results.reduce((m, r) => (m[r.data.guid] = r.data, m), {} as Record<string, IItem>);
    this.state.searchResults.set(map);
  }

  setColor(color: RequestColor | undefined): void {
    this.state.color.set(color);
    this.state.showingColorPicker.set(false);
    this.state.modifyingCloset.set(false);
  }

  toggleColorPicker(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.state.showingColorPicker.update(v => !v);
  }

  toggleHideUnselected(): void {
    this.state.hideUnselected.update(v => !v);
    this.state.typeFolded.set({});
    localStorage.setItem('closet.hide-unselected', this.state.hideUnselected() ? '1' : '0');
  }

  toggleItemSize(): void {
    this.state.itemSize.update(v => v === 'small' ? 'default' : 'small');
    localStorage.setItem('closet.item-size', this.state.itemSize());
  }

  toggleIap(): void {
    this.state.hideIap.update(v => !v);
  }

  toggleCloset(): void {
    this.state.closetMode.update(v => v === 'all' ? 'closet' : 'all');
    if (this.state.closetMode() !== 'closet') {
      this.state.modifyingCloset.set(false);
    }
    localStorage.setItem('closet.show-mode', this.state.closetMode());
  }

  modifyCloset(): void {
    this.state.modifyingCloset.update(v => !v);
    if (this.state.modifyingCloset()) {
      this.state.closetMode.set('closet');
    }
  }

  showBackgroundPicker(evt: MouseEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.state.showingBackgroundPicker.update(v => !v);
  }
}
