import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  output,
  signal,
} from '@angular/core';
import createPanZoom, { PanZoom } from 'panzoom';
import { IconPickerComponent } from '@app/components/util/icon-picker/icon-picker.component';
import { MatIcon } from '@angular/material/icon';
import { IItem } from 'skygame-data';
import { TooltipDirective } from '@app/directives/tooltip.directive';

export interface ICollageSlotImage {
  url: string;
  panZoom: PanZoom;
  element: HTMLImageElement;
}

@Component({
  selector: 'atmos-collage-slot',
  templateUrl: './atmos-collage-slot.component.html',
  styleUrl: './atmos-collage-slot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, IconPickerComponent, TooltipDirective],
})
export class AtmosCollageSlotComponent implements AfterViewInit, OnDestroy {
  /** Zero-based index of this slot in the collage grid (0-3). */
  readonly slotIndex = input.required<number>();

  /** Output when the image URL for this slot changes (null = cleared). */
  readonly imageChanged = output<{ index: number; url: string | null }>();

  @ViewChild('imgEl') private readonly _imgEl!: ElementRef<HTMLImageElement>;
  @ViewChild('imgContainer') private readonly _imgContainer!: ElementRef<HTMLElement>;
  @ViewChild('pasteInput') private readonly _pasteInput!: ElementRef<HTMLInputElement>;

  // Slot state
  readonly imageUrl = signal<string>('');
  readonly iconUrl = signal<string>('');
  readonly isPasting = signal<boolean>(false);
  readonly showIconPicker = signal<boolean>(false);

  // Panzoom instance
  panZoom?: PanZoom;

  /** Expose image element for canvas render access. */
  get imageElement(): HTMLImageElement | null {
    return this._imgEl?.nativeElement ?? null;
  }

  /** Expose container element for render clip math. */
  get containerElement(): HTMLElement | null {
    return this._imgContainer?.nativeElement ?? null;
  }

  ngAfterViewInit(): void {
    const el = this._imgEl.nativeElement;
    this.panZoom = createPanZoom(el, {
      zoomSpeed: 0.05,
      smoothScroll: false,
    });
    this.panZoom.on('panend', () => this._refocusPasteInput());
    this.panZoom.on('zoomend', () => this._refocusPasteInput());
  }

  ngOnDestroy(): void {
    this.panZoom?.dispose();
  }

  // ── Public API (called by host) ────────────────────────────────────────

  /** Set image URL externally (used for bulk-paste coordination from host). */
  setImageUrl(url: string): void {
    this.imageUrl.set(url);
    this.imageChanged.emit({ index: this.slotIndex(), url: url || null });
  }

  /** Start paste mode: focus the hidden textarea. */
  activatePaste(): void {
    this.isPasting.set(true);
    setTimeout(() => {
      const el = this._pasteInput?.nativeElement;
      if (el) { el.value = ''; el.focus(); }
    });
  }

  /** Deactivate paste mode. */
  deactivatePaste(): void {
    this.isPasting.set(false);
    const el = document.activeElement;
    if (el instanceof HTMLElement) { el.blur(); }
  }

  /** Copy panzoom position from another slot image (for bulk-paste continuity). */
  copyPanZoomFrom(src: AtmosCollageSlotComponent): void {
    if (!this.panZoom || !src.panZoom) { return; }
    const t = src.panZoom.getTransform();
    this.panZoom.moveTo(t.x, t.y);
    this.panZoom.zoomAbs(t.x, t.y, t.scale);
  }

  /** Center the image within its container, scaling to fit. */
  centerPanZoom(): void {
    const img = this._imgEl?.nativeElement;
    if (!img || !(img.naturalWidth > 0) || !this.panZoom) { return; }

    const container = this._imgContainer?.nativeElement;
    const bounds = container?.getBoundingClientRect();
    const pw = bounds?.width ?? 192;
    const ph = bounds?.height ?? 288;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const fx = pw / w;

    const zoomFactor = fx < 0.25 ? 4 : fx < 0.33 ? 3 : 1;
    const z = fx * zoomFactor;
    const x = (w * z) / 2 - pw / 2;
    const y = (h * z) / 2 - ph / 2;

    this.panZoom.zoomAbs(0, 0, z);
    this.panZoom.moveTo(-x, -y);
  }

  // ── Template event handlers ────────────────────────────────────────────

  onPasteAreaClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this._refocusPasteInput();
  }

  onClosePaste(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.deactivatePaste();
  }

  onPaste(event: ClipboardEvent): void {
    const url = this._imgUrlFromClipboard(event);
    if (!url) { return; }
    this.imageUrl.set(url);
    this.imageChanged.emit({ index: this.slotIndex(), url });
    this.deactivatePaste();
  }

  onPickFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { return; }
      try {
        const url = URL.createObjectURL(file);
        this.imageUrl.set(url);
        this.imageChanged.emit({ index: this.slotIndex(), url });
      } catch (e) { console.error(e); }
    };
    input.click();
  }

  onClear(): void {
    if (!confirm('Are you sure you want to remove this image?')) { return; }
    this.imageUrl.set('');
    this.iconUrl.set('');
    this.imageChanged.emit({ index: this.slotIndex(), url: null });
  }

  onImageLoaded(): void {
    this.centerPanZoom();
  }

  onOpenIconPicker(): void {
    this.showIconPicker.set(true);
  }

  onIconPickerSelected(item: IItem): void {
    this.iconUrl.set(item?.icon ?? '');
    this.showIconPicker.set(false);
  }

  onIconPickerClosed(): void {
    this.showIconPicker.set(false);
  }

  onIconClick(): void {
    this.showIconPicker.set(true);
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private _refocusPasteInput(): void {
    if (!this.isPasting()) { return; }
    const el = this._pasteInput?.nativeElement;
    if (el) { el.focus(); }
  }

  private _imgUrlFromClipboard(event: ClipboardEvent): string | undefined {
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
}
