import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  signal,
  viewChildren,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { AtmosToolQuickActionsComponent } from '@app/redesign/tool/quick-actions/atmos-tool-quick-actions.component';
import { AtmosCollageSlotComponent } from './atmos-collage-slot.component';

/** Fixed 2×2 collage layout — 4 slots total. */
const COLS = 2;
const ROWS = 2;

/** Preview / render dimensions — MUST match legacy render() math. */
const SIZES = {
  previewWidth:  192,
  previewHeight: 288,
  renderWidth:   288,   // 192 * 1.5
  renderHeight:  432,   // 288 * 1.5
  renderIconWidth: 64,
} as const;

/** Convenience tuple for iteration. */
const SLOT_INDICES = [0, 1, 2, 3] as const;

@Component({
  selector: 'app-atmos-collage',
  templateUrl: './atmos-collage.component.html',
  styleUrl: './atmos-collage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TooltipDirective, AtmosToolQuickActionsComponent, AtmosCollageSlotComponent],
})
export class AtmosCollageComponent implements OnInit, OnDestroy {
  /** Expose for template iteration. */
  readonly slotIndices = SLOT_INDICES;

  readonly isRendering = signal<boolean>(false);

  /** Track icon URLs per slot for canvas render. */
  readonly iconUrls = signal<string[]>(['', '', '', '']);

  /** Track image URLs per slot for canvas render state. */
  readonly imageUrls = signal<string[]>(['', '', '', '']);

  /** Reference to all 4 slot components. */
  readonly slots = viewChildren(AtmosCollageSlotComponent);

  /** Index of the slot currently in paste mode (for document-level paste listener). */
  private _pasteSlotIndex?: number;
  private _bulkPaste = false;
  private _pasteHandler?: (e: ClipboardEvent) => void;

  @HostListener('window:focus')
  onWindowFocus(): void {
    if (this._pasteSlotIndex !== undefined) {
      this.slots()[this._pasteSlotIndex]?.activatePaste();
    }
  }

  ngOnInit(): void {
    // Document-level paste listener (matches legacy window.addEventListener pattern).
    this._pasteHandler = (evt: ClipboardEvent) => this._onDocumentPaste(evt);
    document.addEventListener('paste', this._pasteHandler);
  }

  ngOnDestroy(): void {
    if (this._pasteHandler) {
      document.removeEventListener('paste', this._pasteHandler);
    }
  }

  // ── Slot output handler ─────────────────────────────────────────────

  onSlotImageChanged(event: { index: number; url: string | null }): void {
    const urls = [...this.imageUrls()];
    urls[event.index] = event.url ?? '';
    this.imageUrls.set(urls);

    // Advance bulk paste to next slot if needed.
    if (this._bulkPaste && this._pasteSlotIndex === event.index && event.url) {
      this._advanceBulkPaste(event.index);
    }
  }

  onSlotIconChanged(index: number, url: string): void {
    const icons = [...this.iconUrls()];
    icons[index] = url;
    this.iconUrls.set(icons);
  }

  // ── Export actions ──────────────────────────────────────────────────

  saveCollage(): void {
    const canvas = this._render();
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'sky-outfit-collage.png';
    link.click();
  }

  copyCollage(ttCopy: TooltipDirective): void {
    this.isRendering.set(true);
    const canvas = this._render();

    const done = () => { this.isRendering.set(false); };
    const renderPromise = new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        blob ? resolve(blob) : reject('Failed to render image.');
      });
    });

    try {
      const item = new ClipboardItem({ 'image/png': renderPromise });
      navigator.clipboard.write([item]).then(() => {
        done();
        ttCopy.open();
        setTimeout(() => { ttCopy.close(); }, 1000);
      }).catch(err => {
        console.error(err);
        alert('Copying failed. Please make sure the document is focused.');
        done();
      });
    } catch (e) { console.error(e); done(); }
  }

  reset(): void {
    if (!confirm('Are you sure you want to reset all images?')) { return; }
    this.imageUrls.set(['', '', '', '']);
    this.iconUrls.set(['', '', '', '']);
    this._pasteSlotIndex = undefined;
    this._bulkPaste = false;
    this.slots().forEach(slot => {
      slot.setImageUrl('');
      slot.deactivatePaste();
    });
  }

  // ── Private helpers ─────────────────────────────────────────────────

  private _onDocumentPaste(_evt: ClipboardEvent): void {
    // Paste is handled by the slot's own paste input element — nothing to do here
    // at the document level. This listener mirrors the legacy pattern but the
    // actual paste processing lives in AtmosCollageSlotComponent.onPaste().
  }

  private _advanceBulkPaste(currentIndex: number): void {
    const next = currentIndex + 1;
    if (next >= COLS * ROWS) {
      this._pasteSlotIndex = undefined;
      this._bulkPaste = false;
      return;
    }
    this._pasteSlotIndex = next;
    this.slots()[next]?.activatePaste();
  }

  /**
   * Renders the collage to an offscreen canvas.
   * Verbatim port of the legacy render() method, adjusted for 2×2 fixed layout.
   * Attribution text: "Images from the Sky Wiki, used with permission."
   */
  private _render(): HTMLCanvasElement {
    const _wBorder = 0;
    const iconUrls = this.iconUrls();
    const hasIcons = iconUrls.some(u => u.length > 0);

    const canvas = document.createElement('canvas');
    canvas.width  = SIZES.renderWidth  * COLS + _wBorder * (COLS + 1);
    canvas.height = SIZES.renderHeight * ROWS + _wBorder * (ROWS + 1) + (hasIcons ? 13 : 0);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const drawSlot = (slotComp: AtmosCollageSlotComponent, col: number, row: number) => {
      const img = slotComp.imageElement;
      if (!img || !(img.naturalWidth > 0)) { return; }

      const clipDiv = slotComp.containerElement;
      if (!clipDiv) { return; }

      const imgBounds  = img.getBoundingClientRect();
      const clipBounds = clipDiv.getBoundingClientRect();

      const fx = (clipBounds.left - imgBounds.left) / imgBounds.width;
      const fy = (clipBounds.top  - imgBounds.top)  / imgBounds.height;
      const sx = fx * img.naturalWidth;
      const sy = fy * img.naturalHeight;
      const w  = clipBounds.width  / imgBounds.width  * img.naturalWidth;
      const h  = clipBounds.height / imgBounds.height * img.naturalHeight;

      const dx = (col + 1) * _wBorder + col * SIZES.renderWidth;
      const dy = (row + 1) * _wBorder + row * SIZES.renderHeight;

      ctx.drawImage(img, sx, sy, w, h, dx, dy, SIZES.renderWidth, SIZES.renderHeight);

      // Draw icon badge
      const slotIndex = row * COLS + col;
      if (iconUrls[slotIndex]) {
        const iconEl = document.querySelector(
          `.atmos-collage-slot[data-slot-index="${slotIndex}"] .slot__icon-img`
        ) as HTMLImageElement | null;
        if (iconEl && iconEl.naturalWidth > 0) {
          const iw = SIZES.renderIconWidth;
          ctx.fillStyle = '#0008';
          ctx.beginPath();
          ctx.roundRect(dx + 4, dy + SIZES.renderHeight - iw - 4, iw, iw, 8);
          ctx.fill();
          ctx.drawImage(iconEl, 0, 0, iconEl.naturalWidth, iconEl.naturalHeight, dx + 4, dy + SIZES.renderHeight - iw - 4, iw, iw);
        }
      }
    };

    // Draw all slots
    const slotComps = this.slots();
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = row * COLS + col;
        const comp = slotComps[idx];
        if (comp) { drawSlot(comp, col, row); }
      }
    }

    // Draw attribution footer (wiki attribution text — verbatim)
    if (hasIcons) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, canvas.height - 13, canvas.width, canvas.height);
      ctx.fillStyle = '#446';
      ctx.font = '12px Roboto, sans-serif';
      ctx.textAlign = 'right';
      const msg = 'Images from the Sky Wiki, used with permission.';
      ctx.fillText(msg, canvas.width - 4, canvas.height - 3);
    }

    return canvas;
  }
}
