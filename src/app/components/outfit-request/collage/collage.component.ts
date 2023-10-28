import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import createPanZoom, { PanZoom } from 'panzoom';

interface IImage {
  panZoom: PanZoom;
  element: HTMLImageElement;
}

interface ICoord {
  x: number;
  y: number;
}

const sizes = {
  previewWidith: 192,
  previewHeight: 288,
  renderWidth: 192 * 1.5,
  renderHeight: 288 * 1.5,
};

@Component({
  selector: 'app-collage',
  templateUrl: './collage.component.html',
  styleUrls: ['./collage.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollageComponent implements AfterViewInit {
  @ViewChildren('collagePaste') private readonly _collagePaste!: QueryList<ElementRef>;
  @ViewChildren('collageImage') private readonly _collageImage!: QueryList<ElementRef>;

  blockSize = {
    x: Array(6).fill(false),
    y: Array(3).fill(false)
  };
  collageSize: ICoord = { x: 4, y: 1 };
  files: Array<Array<string>>;
  images: Array<Array<IImage>>;
  iPaste?: number;
  iQuickPaste?: number;

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef,
  ) {
    this.setCollageSize(4, 1);
    this.files = [];
    this.images = [];

    // Create empty files array.
    for (let iy = 0; iy < this.blockSize.y.length; iy++) {
      this.files.push([]); this.images.push([]);
      for (let ix = 0; ix < this.blockSize.x.length; ix++) {
        this.files[iy][ix] = '';
      }
    }
  }

  ngAfterViewInit(): void {
    // Create panzoom for each image.
    for (let iy = 0; iy < this.blockSize.y.length; iy++) {
      for (let ix = 0; ix < this.blockSize.x.length; ix++) {
        const n = iy * this.blockSize.x.length + ix;
        const el = this._collageImage.get(n)?.nativeElement as HTMLImageElement;
        const p = this.createPanZoom(el);
        this.images[iy][ix] = { panZoom: p, element: el };
      }
    }
  }

  setCollageSize(w: number, h: number): void {
    this.collageSize = { x: w, y: h };
    this.stopPaste();

    this._changeDetectorRef.markForCheck();
  }

  startPaste(ix: number, iy: number, evt?: Event): void {
    this.iPaste = ix + iy * this.blockSize.x.length;

    // If quick paste is active, match it to the current paste.
    if (this.iQuickPaste !== undefined && this.iPaste !== this.iQuickPaste) {
      this.iQuickPaste = this.iPaste;
    }

    const el = this._collagePaste.get(this.iPaste!)?.nativeElement as HTMLInputElement;
    if (!el) { return; }

    el.value = '';
    evt?.preventDefault();
    evt?.stopPropagation();
    this._changeDetectorRef.markForCheck();
    setTimeout(() => { el.focus(); })
  }


  startQuickPaste(): void {
    if (this.iQuickPaste !== undefined)  {
      this.stopPaste();
      return;
    }

    this.iQuickPaste = this.iPaste !== undefined ? this.iPaste -1 : -1;
    this.quickPasteNext();
  }

  private quickPasteNext(): void {
    if (this.iQuickPaste == undefined) { return; }
    let ix = 0; let iy = 0;
    while (iy < this.collageSize.y) {
      this.iQuickPaste++;
      ix = this.iQuickPaste % this.blockSize.x.length;
      iy = Math.floor(this.iQuickPaste / this.blockSize.x.length);
      if (ix < this.collageSize.x && iy < this.collageSize.y) { break; }
    }

    if (iy >= this.collageSize.y) {
      this.stopPaste();
      return;
    }

    this.startPaste(ix, iy);
  }

  onPanZoomEnd(): void {
    this.focusPaste();
  }

  focusPaste(evt?: Event): void {
    if (this.iPaste === undefined) { return; }
    const el = this._collagePaste.get(this.iPaste!)?.nativeElement as HTMLInputElement;
    if (!el) { return; }

    evt?.preventDefault();
    evt?.stopPropagation();
    el.focus();
  }

  stopPaste(evt?: Event): void {
    evt?.preventDefault();
    evt?.stopPropagation();
    this.iPaste = undefined;
    this.iQuickPaste = undefined;
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
  }

  paste(event: ClipboardEvent, ix: number, iy: number): void {
    this._changeDetectorRef.markForCheck();
    const imgUrl = this.getImgUrlFromClipboard(event);
    if (!imgUrl) { return; }

    this.files[iy][ix] = imgUrl;
    this.copyPrevPanZoom(ix, iy);

    this.iPaste = undefined;
    this.iQuickPaste !== undefined && this.quickPasteNext();
  }

  clearTxt(evt: Event): void{
    const inp = evt.target as HTMLInputElement;
    inp.value = '';
  }

  pickFile(ix: number, iy: number): void {
    this.files[iy][ix] = '';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.item(0);
      if (!file) { return; }
      const url  = URL.createObjectURL(file);
      this.files[iy][ix] = url;
      this.copyPrevPanZoom(ix, iy);
      // this.images[y][x].panZoom.moveTo(0, 0);
      // this.images[y][x].panZoom.zoomAbs(0, 0, 1);
      this._changeDetectorRef.markForCheck();
    };
    input.click();
  }

  clearFile(ix: number, iy: number): void {
    if (!confirm('Are you sure you want to remove this image?')) { return; }
    this.files[iy][ix] = '';
    this._changeDetectorRef.markForCheck();
  }

  saveCollage(): void {
    const canvas = this.render();
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'sky-outfit-collage.png';
    link.click();
  }

  copyCollage(): void {
    const canvas = this.render();
    canvas.toBlob(blob => {
      if (!blob) { return; }
      const item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item]).then(() => {
        console.log('Image copied to clipboard');
      }).catch(error => {
        console.error('Could not copy image to clipboard: ', error);
        alert('Copy failed. Please make sure the document is focused.');
      });
    });
  }

  reset(): void {
    if (!confirm('Are you sure you want to reset all images?')) { return; }
    for (let iy = 0; iy < this.blockSize.y.length; iy++) {
      for (let ix = 0; ix < this.blockSize.x.length; ix++) {
        this.files[iy][ix] = '';
      }
    }
    this.iPaste = undefined;
    this.iQuickPaste = undefined;
    this._changeDetectorRef.markForCheck();

  }

  private createPanZoom(el: HTMLElement): PanZoom {
    return createPanZoom(el, {
      zoomSpeed: 0.05,
      smoothScroll: false
    });
  }

  private getPrevPanZoom(ix: number, iy: number): PanZoom | undefined {
    while (ix >= 0 && iy >= 0) {
      if (--ix < 0) { ix = 4; iy--; }
      if (iy < 0) { return undefined; }
      const img = this.images[iy][ix].element;
      if (img?.naturalWidth > 0) {
        return this.images[iy][ix].panZoom;
      }
    }
    return undefined;
  }

  private copyPanZoom(from: PanZoom, to: PanZoom): void {
    to.moveTo(from.getTransform().x, from.getTransform().y);
    to.zoomAbs(from.getTransform().x, from.getTransform().y, from.getTransform().scale);
  }

  private copyPrevPanZoom(ix: number, iy: number): void {
    const prev = this.getPrevPanZoom(ix, iy);
    prev && this.copyPanZoom(prev, this.images[iy][ix].panZoom);
  }

  private render(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = sizes.renderWidth * this.collageSize.x;
    canvas.height = sizes.renderHeight * this.collageSize.y;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    // Draw  images
    for (let iy = 0; iy < this.collageSize.y; iy++) {
      for (let ix = 0; ix < this.collageSize.x; ix++) {
        const img = this.images[iy][ix].element;
        if (!(img?.naturalWidth > 0)) { continue; }
        this.drawImage(ctx, img, ix, iy);
      }
    }

    return canvas;
  }

  private drawImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, ix: number, iy: number): void {
    const clipDiv =  img.closest('.collage-image-container') as HTMLElement;
    const imgBounds = img.getBoundingClientRect();
    const clipBounds = clipDiv.getBoundingClientRect();

    // Calculate starting coordinates of clipped image.
    const fx = (clipBounds.left - imgBounds.left) / imgBounds.width;
    const fy = (clipBounds.top - imgBounds.top) / imgBounds.height;
    const sx = fx * img.naturalWidth;
    const sy = fy * img.naturalHeight;
    const w = clipBounds.width / imgBounds.width * img.naturalWidth;
    const h = clipBounds.height / imgBounds.height * img.naturalHeight;

    // Draw the intersected part of the image on the canvas
    ctx.drawImage(img, sx, sy, w, h, ix * sizes.renderWidth, iy * sizes.renderHeight, sizes.renderWidth, sizes.renderHeight);
  }

  private getImgUrlFromClipboard(event: ClipboardEvent): string | undefined {
    // Loosely based on https://stackoverflow.com/a/60504384/8523745
    if (!event.clipboardData) { return undefined; }
    var items = event.clipboardData.items;
    if (!items) { return undefined; }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].type.includes('image')) continue;
      const file = items[i].getAsFile();
      return file ? URL.createObjectURL(file) : undefined;
    }

    return undefined;
  }
}
