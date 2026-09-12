import { IItem, ItemType } from 'skygame-data';
import { IDye, DyeColor, ISelection } from './closet-state.service';

/** Size of padding from edge. */
const _wPad = 20;
/** Size of item icon */
const _wItem = 64;
/** Size of dye icon */
const _wDye = 32;
/** Size of gap between items. */
const _wGap = 8;
/** Size of item with gap. */
const _wBox = _wItem + _wGap;
/** Inner padding of a panel. */
const _wPanel = 12;
/** Height reserved for a panel label. */
const _hLabel = 22;
/** Height of the footer bar. */
const _hFooter = 30;
/** Alpha for missing items. */
const _aHide = 0.1;
const _aHalfHide = 0.4;

const _rPanel = 14;
const _rTile = 10;

const _font = '-apple-system, "Segoe UI", Roboto, system-ui, sans-serif';

const _cPanel = 'rgba(9, 14, 24, 0.55)';
const _cPanelEdge = 'rgba(255, 255, 255, 0.10)';
const _cTile = 'rgba(255, 255, 255, 0.05)';
const _cLabel = 'rgba(255, 255, 255, 0.78)';
const _cFooter = 'rgba(255, 255, 255, 0.62)';
const _cBase = '#0b1018';
const _cScrim = 'rgba(5, 9, 18, 0.42)';

/** Overdraw of the background image, so a blurring filter never samples past its edge. */
const _wBleed = 48;
/**
 * Extra blur on top of the per-background filter, applied only to the render.
 * It keeps the icons legible over busy screenshots, and the smoother backdrop
 * is worth roughly a third of the PNG that gets pasted into a chat.
 */
const _bgBlur = 10;

export type CopyImageMode = 'request' | 'square' | 'closet' | 'template';

export interface ClosetRendererOptions {
  /** Lookup DOM image for a given item GUID (reads data-guid on .closet-item). */
  imageLookup: (guid: string) => HTMLImageElement | null;
  bgImg: HTMLImageElement;
  bgFilter?: string;
  bgAttribution?: string;
  items: Partial<Record<string, IItem[]>>;
  itemMap: Record<string, IItem>;
  selected: { all: ISelection; r: ISelection; y: ISelection; g: ISelection; b: ISelection };
  dyes: Record<string, IDye[]>;
  svgDyes: Record<string, SVGElement>;
  imgSheets: Record<string, HTMLImageElement>;
  iconLookup: (icon: string) => { file: string; x: number; y: number } | undefined;
  imgNone: HTMLImageElement;
  imgUnknown: HTMLImageElement;
  hidden: Record<string, boolean>;
  ongoingItems: Record<string, IItem>;
  showOngoing: boolean;
  hideIap: boolean;
  requesting: boolean;
}

interface IPanel {
  type: ItemType;
  items: IItem[];
  rows: number;
  height: number;
}

const _labels: Partial<Record<ItemType, string>> = {
  [ItemType.Outfit]: 'Outfits',
  [ItemType.Shoes]: 'Shoes',
  [ItemType.OutfitShoes]: 'Outfits & shoes',
  [ItemType.Mask]: 'Masks',
  [ItemType.FaceAccessory]: 'Face accessories',
  [ItemType.Necklace]: 'Necklaces',
  [ItemType.Hair]: 'Hair',
  [ItemType.HairAccessory]: 'Hair accessories',
  [ItemType.HeadAccessory]: 'Head accessories',
  [ItemType.Cape]: 'Capes',
  [ItemType.Held]: 'Held props',
  [ItemType.Furniture]: 'Furniture',
  [ItemType.Prop]: 'Props'
};

/** Column layout of the wide renders: items per row, and the types stacked in it. */
const _columns: Array<{ cols: number; types: ItemType[] }> = [
  { cols: 10, types: [ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes, ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace] },
  { cols: 7, types: [ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory] },
  { cols: 5, types: [ItemType.Cape] },
  { cols: 7, types: [ItemType.Held, ItemType.Furniture, ItemType.Prop] }
];

/**
 * Encodes a canvas, preferring WebP where the target accepts it. A closet is
 * mostly flat colour over a soft background, so WebP lands far below the PNG
 * for the same picture; PNG stays the fallback, and the only format browsers
 * reliably accept on the clipboard.
 */
export async function canvasToBlob(canvas: HTMLCanvasElement, type: 'image/webp' | 'image/png' = 'image/png'): Promise<Blob> {
  const encode = (t: string, q?: number) => new Promise<Blob | null>(res => canvas.toBlob(b => res(b), t, q));
  if (type === 'image/webp') {
    const webp = await encode('image/webp', 0.92);
    if (webp?.type === 'image/webp') { return webp; }
  }
  const png = await encode('image/png');
  if (!png) { throw new Error('render failed'); }
  return png;
}

/**
 * Plain class (not @Injectable) that owns the canvas rendering for the closet
 * and outfit request views.
 *
 * Instead of scraping DOM icons via querySelectorAll, it accepts an
 * `imageLookup` callback so templates only need data-guid on item thumbnails.
 */
export class ClosetRenderer {
  private readonly _markers: Record<string, string>;
  private readonly _dyeColors: Record<string, string>;

  constructor(private readonly opts: ClosetRendererOptions) {
    // The marker tokens live on the closet component hosts, not on :root.
    const markerHost = document.querySelector('.atmos-closet-item') ?? document.body;
    const markerStyle = getComputedStyle(markerHost);
    const rootStyle = getComputedStyle(document.body);
    const read = (name: string, fallback: string) =>
      (markerStyle.getPropertyValue(name) || rootStyle.getPropertyValue(name)).trim() || fallback;
    this._markers = {
      r: read('--closet-marker-r', '#f00'), y: read('--closet-marker-y', '#ff0'),
      g: read('--closet-marker-g', '#0f0'), b: read('--closet-marker-b', '#0aa0ff')
    };
    this._dyeColors = {};
    for (const dye of ['red', 'purple', 'blue', 'cyan', 'green', 'yellow', 'black', 'white']) {
      this._dyeColors[dye] = read(`--atmos-dye-${dye}`, '');
    }
  }

  renderSquare(): HTMLCanvasElement {
    const { selected, dyes, imgNone, imgUnknown, imageLookup, itemMap, iconLookup, imgSheets } = this.opts;

    const getSelectedPerType = (selection: ISelection) =>
      Object.values(selection).reduce((map, item) => {
        let type = item.type;
        if (type === ItemType.Furniture || type === ItemType.Held) { type = ItemType.Prop; }
        if (type === ItemType.OutfitShoes) { type = ItemType.Outfit; }
        if (!map[type]) { map[type] = item; }
        return map;
      }, {} as Record<string, IItem>);

    const selectedByType = [
      getSelectedPerType(selected.r),
      getSelectedPerType(selected.y),
      getSelectedPerType(selected.g),
      getSelectedPerType(selected.b)
    ];
    selectedByType.sort((a, b) => Object.keys(b).length - Object.keys(a).length);

    const getItemByType = (type: ItemType) => selectedByType.find(m => m[type])?.[type];
    const itemTypes = [
      ItemType.Outfit, ItemType.Shoes, ItemType.Mask,
      ItemType.FaceAccessory, ItemType.Necklace, ItemType.Hair, ItemType.HairAccessory,
      ItemType.HeadAccessory, ItemType.Cape, ItemType.Prop
    ];
    const items = itemTypes.map(getItemByType);

    const dyeRowsOf = (item: IItem | undefined) => {
      if (!item) { return 0; }
      const itemDyes = dyes[item.guid];
      if (!item.dye?.primary || !itemDyes?.[0]) { return 0; }
      return item.dye.secondary && itemDyes[1] ? 2 : 1;
    };
    const dyeRows = items.reduce((rows, item) => Math.max(rows, dyeRowsOf(item)), 0);

    const cardW = _wItem + _wPanel;
    const cardH = _wItem + _wDye * dyeRows + _wPanel;
    const canvas = document.createElement('canvas');
    canvas.width = cardW * 5 + _wGap * 4 + _wPad * 2;
    canvas.height = cardH * 2 + _wGap + _wPad * 2 + _hFooter;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    this._drawBackground(ctx);

    const placeholders = [
      'EEQZwFIJRs', '_k3jPMWKOY', 'Em7ZxGZAN5',
      'fR9CRzzD25', '_5IHtakDvf', 'QmNo-bmeLi', 'E_yfCZYU5C',
      'f-X2dDeB9w', 'ec8jU3Gerw', 'biKOov4qJQ'
    ];
    const placeholderItems = placeholders.map(guid => itemMap[guid]);

    items.forEach((item, i) => {
      const cx = _wPad + (i % 5) * (cardW + _wGap);
      const cy = _wPad + Math.floor(i / 5) * (cardH + _wGap);
      const x = cx + _wPanel / 2;
      const y = cy + _wPanel / 2;

      this._panel(ctx, cx, cy, cardW, cardH, _rPanel);

      const drawPlaceholder = () => {
        const pi = placeholderItems[i];
        if (!pi) { return; }
        const mappedIcon = pi.icon ? iconLookup(pi.icon) : undefined;
        const placeholderImg = imageLookup(placeholders[i]);
        if (!placeholderImg && !mappedIcon) { return; }
        ctx.globalAlpha = 0.22;
        if (mappedIcon) {
          const sheet = imgSheets[mappedIcon.file];
          ctx.drawImage(sheet, mappedIcon.x, mappedIcon.y, 128, 128, x, y, _wItem, _wItem);
        } else if (placeholderImg) {
          ctx.drawImage(placeholderImg, x, y, _wItem, _wItem);
        }
        ctx.globalAlpha = 1;
      };

      if (item && item.icon) {
        const img = imageLookup(item.guid);
        if (img?.src === imgNone.src) { drawPlaceholder(); }
        const mappedIcon = iconLookup(item.icon);

        if (mappedIcon) {
          const sheet = imgSheets[mappedIcon.file];
          ctx.drawImage(sheet, mappedIcon.x, mappedIcon.y, 128, 128, x, y, _wItem, _wItem);
        } else if (img) {
          ctx.drawImage(img, x, y, _wItem, _wItem);
        }

        const itemDyes = dyes[item.guid];
        if (item.dye?.primary && itemDyes?.[0]) {
          this._drawDyeRow(ctx, x, y + _wItem, itemDyes[0]);
        }
        if (item.dye?.secondary && itemDyes?.[1]) {
          this._divider(ctx, x + 8, x + _wItem - 8, y + _wItem + _wDye);
          this._drawDyeRow(ctx, x, y + _wItem + _wDye, itemDyes[1]);
        }
      } else {
        drawPlaceholder();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(imgUnknown, x, y, _wItem, _wItem);
        ctx.globalAlpha = 1;
      }
    });

    this._drawFooter(ctx, 12);
    return canvas;
  }

  renderImage(mode: CopyImageMode): HTMLCanvasElement {
    const { items } = this.opts;
    const getItems = (type: ItemType) => items[type as string] || [];

    const layout = _columns.map(col => {
      const width = col.cols * _wBox - _wGap + _wPanel * 2;
      const panels: IPanel[] = col.types
        .map(type => ({ type, items: getItems(type) }))
        .filter(p => p.items.length)
        .map(p => {
          const rows = Math.ceil(p.items.length / col.cols);
          return { ...p, rows, height: _hLabel + rows * _wBox - _wGap + _wPanel * 2 };
        });
      const height = panels.reduce((sum, p) => sum + p.height, 0) + Math.max(0, panels.length - 1) * _wPad;
      return { cols: col.cols, width, panels, height };
    }).filter(c => c.panels.length);

    const canvas = document.createElement('canvas');
    canvas.width = layout.reduce((sum, c) => sum + c.width, 0) + _wPad * (layout.length + 1);
    const contentH = Math.max(...layout.map(c => c.height), 0) + _wPad * 2;
    canvas.height = contentH + _hFooter;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    this._drawBackground(ctx);

    let sx = _wPad;
    for (const column of layout) {
      let sy = _wPad;
      for (const panel of column.panels) {
        this._panel(ctx, sx, sy, column.width, panel.height, _rPanel);
        this._label(ctx, _labels[panel.type] ?? '', sx + _wPanel, sy + _wPanel, panel.items.length);
        this._drawItems(ctx, sx + _wPanel, sy + _wPanel + _hLabel, column.cols, mode, panel.items);
        sy += panel.height + _wPad;
      }
      sx += column.width + _wPad;
    }

    this._drawFooter(ctx, 13);
    return canvas;
  }

  // ── Chrome ────────────────────────────────────────────────────────────────

  private _panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.save();
    ctx.fillStyle = _cPanel;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();

    const sheen = ctx.createLinearGradient(0, y, 0, y + Math.min(h, 140));
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.07)');
    sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheen;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();

    ctx.strokeStyle = _cPanelEdge;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.stroke();
    ctx.restore();
  }

  private _label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, count: number): void {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `600 12px ${_font}`;
    ctx.letterSpacing = '0.09em';
    ctx.fillStyle = _cLabel;
    const label = text.toUpperCase();
    ctx.fillText(label, x, y + 7);
    const labelWidth = ctx.measureText(label).width;
    ctx.letterSpacing = '0px';
    ctx.font = `500 12px ${_font}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(`${count}`, x + labelWidth + 14, y + 7);
    ctx.restore();
  }

  private _divider(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x1, y + 0.5); ctx.lineTo(x2, y + 0.5); ctx.stroke();
    ctx.restore();
  }

  private _drawFooter(ctx: CanvasRenderingContext2D, size: number): void {
    const canvas = ctx.canvas;
    const y = canvas.height - _hFooter;
    ctx.save();
    ctx.fillStyle = 'rgba(6, 10, 18, 0.92)';
    ctx.fillRect(0, y, canvas.width, _hFooter);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(canvas.width, y + 0.5); ctx.stroke();

    const credits = ['© Sky: Children of the Light', 'Icons by the Sky: CotL Wiki'];
    if (this.opts.bgAttribution) { credits.unshift(this.opts.bgAttribution); }
    ctx.textBaseline = 'middle';
    ctx.font = `${size}px ${_font}`;
    ctx.fillStyle = _cFooter;
    ctx.textAlign = 'right';
    ctx.fillText(credits.join('  ·  '), canvas.width - 12, y + _hFooter / 2);
    ctx.restore();
  }

  // ── Background ────────────────────────────────────────────────────────────

  private _drawBackground(ctx: CanvasRenderingContext2D): void {
    const { bgImg, bgFilter } = this.opts;
    const canvas = ctx.canvas;
    const height = canvas.height;

    // Opaque base: the filters below are authored per background and several of
    // them blur, which would otherwise bleed the canvas edges to transparent.
    ctx.save();
    ctx.fillStyle = _cBase;
    ctx.fillRect(0, 0, canvas.width, height);

    if (bgImg?.naturalWidth && bgImg.naturalHeight) {
      const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
      let dw: number, dh: number;
      if (imgAspect > canvas.width / height) {
        dh = height; dw = imgAspect * dh;
      } else {
        dw = canvas.width; dh = dw / imgAspect;
      }

      // Overdraw so a blurring filter samples image, not the transparent edge.
      const x = canvas.width / 2 - dw / 2;
      const y = height / 2 - dh / 2;
      ctx.beginPath(); ctx.rect(0, 0, canvas.width, height); ctx.clip();
      ctx.filter = `${bgFilter ?? 'brightness(0.6)'} blur(${_bgBlur}px)`;
      ctx.drawImage(
        bgImg, 0, 0, bgImg.naturalWidth, bgImg.naturalHeight,
        x - _wBleed, y - _wBleed, dw + _wBleed * 2, dh + _wBleed * 2
      );
      ctx.filter = 'none';
    }

    // Even scrim: backgrounds range from dimmed to full brightness, and the
    // panels need the same contrast under all of them.
    ctx.fillStyle = _cScrim;
    ctx.fillRect(0, 0, canvas.width, height);
    ctx.restore();
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  private _drawDyeRow(ctx: CanvasRenderingContext2D, x: number, y: number, dye: IDye): void {
    this._drawDye(ctx, dye.primary, x + 2, y);
    this._drawDye(ctx, dye.secondary, x + _wItem - _wDye - 2, y);
  }

  private _drawDye(ctx: CanvasRenderingContext2D, dye: DyeColor | undefined, dx: number, dy: number): void {
    const svgEl = this.opts.svgDyes[dye || 'none'];
    const pathEl = svgEl?.querySelector('path');
    if (!pathEl) { return; }

    ctx.save();
    const path = new Path2D(pathEl.getAttribute('d')!);
    ctx.translate(dx, dy);
    ctx.scale(_wDye / 300, _wDye / 300);
    const color = dye ? this._dyeColors[dye] : '';
    if (!color) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 10;
      ctx.fill(path);
      ctx.stroke(path);
    } else if (dye === 'black') {
      ctx.fillStyle = color;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 10;
      ctx.fill(path);
      ctx.stroke(path);
    } else {
      ctx.fillStyle = color;
      ctx.fill(path);
    }
    ctx.restore();
  }

  private _drawItems(
    ctx: CanvasRenderingContext2D,
    sx: number, sy: number, c: number,
    mode: CopyImageMode,
    items: IItem[]
  ): void {
    const { imageLookup, iconLookup, imgSheets, selected, hidden, ongoingItems, showOngoing, hideIap } = this.opts;
    let x = 0; let y = 0;
    const nextX = () => { if (++x >= c) { x = 0; y++; } };

    for (const item of items) {
      if (!item.icon) { nextX(); continue; }
      const mappedIcon = iconLookup(item.icon);
      const img = imageLookup(item.guid);
      if (!mappedIcon && !img) { nextX(); continue; }

      const ix = sx + x * _wBox;
      const iy = sy + y * _wBox;

      ctx.fillStyle = _cTile;
      ctx.beginPath(); ctx.roundRect(ix, iy, _wItem, _wItem, _rTile); ctx.fill();

      if (mode !== 'template') {
        if (hideIap && item.iaps?.length && !selected.all[item.guid]) { ctx.globalAlpha = _aHide; }
        if (mode === 'request' && !selected.all[item.guid]) { ctx.globalAlpha = _aHide; }
        if (mode === 'closet' && hidden[item.guid]) {
          ctx.globalAlpha = selected.all[item.guid] || (showOngoing && ongoingItems[item.guid]) ? _aHalfHide : _aHide;
        }
      }

      if (mappedIcon) {
        const sheet = imgSheets[mappedIcon.file];
        ctx.drawImage(sheet, mappedIcon.x, mappedIcon.y, 128, 128, ix, iy, _wItem, _wItem);
      } else if (img) {
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, ix, iy, _wItem, _wItem);
      }
      ctx.globalAlpha = 1;

      if (selected.all[item.guid]) { this._drawSelection(ctx, ix, iy, item.guid); }
      nextX();
    }
  }

  private _drawSelection(ctx: CanvasRenderingContext2D, ix: number, iy: number, guid: string): void {
    const { selected } = this.opts;
    const colors: string[] = [];
    if (selected.r[guid]) { colors.push(this._markers['r']); }
    if (selected.y[guid]) { colors.push(this._markers['y']); }
    if (selected.g[guid]) { colors.push(this._markers['g']); }
    if (selected.b[guid]) { colors.push(this._markers['b']); }
    if (!colors.length) { return; }

    ctx.save();
    if (colors.length > 1) {
      const offsetAngle = colors.length === 2 ? -Math.PI : colors.length === 3 ? 7 * Math.PI / 6 : Math.PI;
      const grad = ctx.createConicGradient(offsetAngle, ix + _wItem / 2, iy + _wItem / 2);
      for (let i = 0; i < colors.length; i++) {
        grad.addColorStop(i / colors.length, colors[i]);
        grad.addColorStop((i + 1) / colors.length, colors[i]);
      }
      ctx.strokeStyle = grad;
    } else {
      ctx.strokeStyle = colors[0];
    }

    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(ix + 1.5, iy + 1.5, _wItem - 3, _wItem - 3, _rTile - 1); ctx.stroke();
    ctx.restore();
  }
}
