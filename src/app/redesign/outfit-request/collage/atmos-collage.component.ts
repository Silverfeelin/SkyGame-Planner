import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  signal,
  viewChildren,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { AtmosToolQuickActionsComponent } from '@app/redesign/tool/quick-actions/atmos-tool-quick-actions.component';
import { AtmosCollageSlotComponent } from './atmos-collage-slot.component';

/** Largest collage the page offers; the visible size is picked within these bounds. */
const BLOCK_COLS = 6;
const BLOCK_ROWS = 3;
const BLOCK_COUNT = BLOCK_COLS * BLOCK_ROWS;

/** Preview / render dimensions — MUST match legacy render() math. */
const SIZES = {
  previewWidth:  192,
  previewHeight: 288,
  renderWidth:   288,   // 192 * 1.5
  renderHeight:  432,   // 288 * 1.5
  renderIconWidth: 64,
} as const;

interface ICoord { x: number; y: number; }

@Component({
  selector: 'app-atmos-collage',
  templateUrl: './atmos-collage.component.html',
  styleUrl: './atmos-collage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, TooltipDirective, AtmosToolQuickActionsComponent, AtmosCollageSlotComponent],
})
export class AtmosCollageComponent {
  readonly blockCols = BLOCK_COLS;
  /** Every block of the maximum grid; slots outside the chosen size are dimmed. */
  readonly blockIndices = Array.from({ length: BLOCK_COUNT }, (_, i) => i);

  /** Chosen collage size, in blocks. */
  readonly collageSize = signal<ICoord>({ x: 4, y: 1 });

  readonly isRendering = signal<boolean>(false);

  /** Icon URLs per slot, mirrored from the slots for the canvas render. */
  readonly iconUrls = signal<string[]>(Array(BLOCK_COUNT).fill(''));

  /** Image URLs per slot, mirrored from the slots for the canvas render. */
  readonly imageUrls = signal<string[]>(Array(BLOCK_COUNT).fill(''));

  readonly slots = viewChildren(AtmosCollageSlotComponent);

  /** Slot currently in paste mode, and whether it continues to the next slot. */
  private _pasteSlotIndex?: number;
  private _bulkPaste = false;

  @HostListener('window:focus')
  onWindowFocus(): void {
    if (this._pasteSlotIndex !== undefined) {
      this.slots()[this._pasteSlotIndex]?.focusPasteInput();
    }
  }

  /** True while the block at this index is part of the chosen collage size. */
  isInCollage(index: number): boolean {
    const size = this.collageSize();
    return index % BLOCK_COLS < size.x && Math.floor(index / BLOCK_COLS) < size.y;
  }

  setCollageSize(x: number, y: number): void {
    this.collageSize.set({ x, y });
    this._stopPaste();
  }

  // ── Slot output handlers ────────────────────────────────────────────

  onSlotImageChanged(event: { index: number; url: string | null }): void {
    const urls = [...this.imageUrls()];
    urls[event.index] = event.url ?? '';
    this.imageUrls.set(urls);

    if (this._pasteSlotIndex === event.index && event.url) {
      this._bulkPaste ? this._advanceBulkPaste(event.index) : this._stopPaste();
    }
  }

  onSlotIconChanged(event: { index: number; url: string }): void {
    const icons = [...this.iconUrls()];
    icons[event.index] = event.url;
    this.iconUrls.set(icons);
  }

  onSlotPasteRequested(event: { index: number; bulk: boolean }): void {
    this._startPaste(event.index, event.bulk);
  }

  onSlotPasteClosed(): void {
    this._stopPaste();
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
      }).catch(err => {
        console.error(err);
        alert('Copying failed. Please make sure the document is focused.');
        done();
      });
    } catch (e) { console.error(e); done(); }
  }

  reset(): void {
    if (!confirm('Are you sure you want to reset all images?')) { return; }
    this.imageUrls.set(Array(BLOCK_COUNT).fill(''));
    this.iconUrls.set(Array(BLOCK_COUNT).fill(''));
    this._stopPaste();
    this.slots().forEach(slot => slot.clearSlot());
  }

  // ── Paste coordination ──────────────────────────────────────────────

  private _startPaste(index: number, bulk: boolean): void {
    if (this._pasteSlotIndex !== undefined && this._pasteSlotIndex !== index) {
      this.slots()[this._pasteSlotIndex]?.deactivatePaste();
    }
    this._pasteSlotIndex = index;
    this._bulkPaste = bulk;
    this.slots()[index]?.activatePaste();
  }

  private _stopPaste(): void {
    if (this._pasteSlotIndex !== undefined) {
      this.slots()[this._pasteSlotIndex]?.deactivatePaste();
    }
    this._pasteSlotIndex = undefined;
    this._bulkPaste = false;
  }

  /** Moves paste mode to the next block inside the chosen collage size. */
  private _advanceBulkPaste(currentIndex: number): void {
    const size = this.collageSize();
    for (let i = currentIndex + 1; i < BLOCK_COUNT; i++) {
      if (i % BLOCK_COLS < size.x && Math.floor(i / BLOCK_COLS) < size.y) {
        this._startPaste(i, true);
        return;
      }
    }
    this._stopPaste();
  }

  // ── Render ──────────────────────────────────────────────────────────

  /**
   * Renders the collage to an offscreen canvas.
   * Port of the legacy render() method.
   */
  private _render(): HTMLCanvasElement {
    const _wBorder = 0;
    const size = this.collageSize();
    const iconUrls = this.iconUrls();
    const hasIcons = this.blockIndices.some(i => this.isInCollage(i) && !!iconUrls[i]);

    const canvas = document.createElement('canvas');
    canvas.width  = SIZES.renderWidth  * size.x + _wBorder * (size.x + 1);
    canvas.height = SIZES.renderHeight * size.y + _wBorder * (size.y + 1) + (hasIcons ? 13 : 0);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const drawSlot = (slotComp: AtmosCollageSlotComponent, col: number, row: number) => {
      const img = slotComp.imageElement;
      if (!img || !(img.naturalWidth > 0)) { return; }

      const clipDiv = slotComp.containerElement;
      if (!clipDiv) { return; }

      const imgBounds  = img.getBoundingClientRect();
      const clipBounds = clipDiv.getBoundingClientRect();

      // Starting coordinates of the clipped (panned/zoomed) part of the image.
      const fx = (clipBounds.left - imgBounds.left) / imgBounds.width;
      const fy = (clipBounds.top  - imgBounds.top)  / imgBounds.height;
      const sx = fx * img.naturalWidth;
      const sy = fy * img.naturalHeight;
      const w  = clipBounds.width  / imgBounds.width  * img.naturalWidth;
      const h  = clipBounds.height / imgBounds.height * img.naturalHeight;

      const dx = (col + 1) * _wBorder + col * SIZES.renderWidth;
      const dy = (row + 1) * _wBorder + row * SIZES.renderHeight;

      ctx.drawImage(img, sx, sy, w, h, dx, dy, SIZES.renderWidth, SIZES.renderHeight);

      const iconEl = slotComp.iconElement;
      if (iconEl && iconEl.naturalWidth > 0) {
        const iw = SIZES.renderIconWidth;
        ctx.fillStyle = '#0008';
        ctx.beginPath();
        ctx.roundRect(dx + 4, dy + SIZES.renderHeight - iw - 4, iw, iw, 8);
        ctx.fill();
        ctx.drawImage(iconEl, 0, 0, iconEl.naturalWidth, iconEl.naturalHeight, dx + 4, dy + SIZES.renderHeight - iw - 4, iw, iw);
      }
    };

    const slotComps = this.slots();
    for (let row = 0; row < size.y; row++) {
      for (let col = 0; col < size.x; col++) {
        const comp = slotComps[row * BLOCK_COLS + col];
        if (comp) { drawSlot(comp, col, row); }
      }
    }

    // Wiki attribution, required when item icons are shown.
    if (hasIcons) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, canvas.height - 13, canvas.width, canvas.height);
      ctx.fillStyle = '#446';
      ctx.font = '12px Roboto, sans-serif';
      ctx.textAlign = 'right';
      const msg = size.x === 1
        ? 'Icons from Sky: Children of the Light Wiki'
        : 'Icons by contributors of the Sky: Children of the Light Wiki';
      ctx.fillText(msg, canvas.width - 4, canvas.height - 3);
    }

    return canvas;
  }
}
