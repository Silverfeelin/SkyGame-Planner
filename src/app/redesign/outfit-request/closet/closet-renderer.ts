import { IItem, ItemType } from 'skygame-data';
import { IDye, DyeColor, ISelection } from './closet-state.service';

/** Size of padding from edge. */
const _wPad = 24;
/** Size of item icon */
const _wItem = 64;
/** Size of dye icon */
const _wDye = 32;
/** Size of gap between items. */
const _wGap = 8;
/** Size of item with gap. */
const _wBox = _wItem + _wGap;
/** Alpha for missing items. */
const _aHide = 0.1;
const _aHalfHide = 0.4;

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

/**
 * Plain class (not @Injectable) that lifts the canvas rendering code from
 * legacy ClosetComponent lines 988–1382.
 *
 * Instead of scraping DOM icons via querySelectorAll, it accepts an
 * `imageLookup` callback so templates only need data-guid on item thumbnails.
 */
export class ClosetRenderer {
  constructor(private readonly opts: ClosetRendererOptions) {}

  renderSquare(): HTMLCanvasElement {
    const { selected, dyes, svgDyes, imgSheets, iconLookup, imgNone, imgUnknown, imageLookup, itemMap } = this.opts;

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

    const canvas = document.createElement('canvas');
    canvas.width = _wItem * 5 + _wGap * 6;
    canvas.height = _wItem * 2 + _wGap * 3 + _wDye * 4 + 24;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    this._drawBackground(ctx);

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';

    let l1 = '© Sky Children of the Light';
    if (this.opts.bgAttribution) { l1 = `${this.opts.bgAttribution} | ${l1}`; }
    ctx.fillText(l1, canvas.width - 8, 15);

    const l2 = 'Icons provided by the Sky: CotL Wiki';
    ctx.fillText(l2, canvas.width - 8, canvas.height - 6);

    const placeholders = [
      'EEQZwFIJRs', '_k3jPMWKOY', 'Em7ZxGZAN5',
      'fR9CRzzD25', '_5IHtakDvf', 'QmNo-bmeLi', 'E_yfCZYU5C',
      'f-X2dDeB9w', 'ec8jU3Gerw', 'biKOov4qJQ'
    ];
    const placeholderItems = placeholders.map(guid => itemMap[guid]);

    items.forEach((item, i) => {
      const x = _wGap + (i % 5) * (_wItem + _wGap);
      const row = Math.floor(i / 5);
      const y = _wGap + row * (_wItem + _wGap + (_wDye * 2)) + 12;

      ctx.fillStyle = '#0006';
      ctx.beginPath(); ctx.roundRect(x, y, _wItem, _wItem + _wDye * 2, 4); ctx.fill();

      const drawPlaceholder = () => {
        const pi = placeholderItems[i];
        if (!pi) { return; }
        const mappedIcon = pi.icon ? iconLookup(pi.icon) : undefined;
        const placeholderImg = imageLookup(placeholders[i]);
        if (!placeholderImg && !mappedIcon) { return; }
        ctx.globalAlpha = 0.25;
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

        if (item.dye?.primary) {
          const drawDye = (dye: DyeColor | undefined, dx: number, dy: number) => {
            ctx.save();
            const color = dye || 'none';
            const svgEl = svgDyes[color];
            if (!svgEl) { ctx.restore(); return; }
            const pathEl = svgEl.querySelector('path');
            if (!pathEl) { ctx.restore(); return; }
            const path = new Path2D(pathEl.getAttribute('d')!);
            ctx.translate(dx, dy);
            ctx.scale(32 / 300, 32 / 300);
            if (color === 'black') {
              ctx.fillStyle = '#232323';
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 3;
              ctx.setLineDash([]);
              ctx.fill(path);
              ctx.stroke(path);
            } else {
              ctx.fillStyle = getComputedStyle(document.body).getPropertyValue(`--dye-${color}`).trim();
              ctx.fill(path);
            }
            ctx.restore();
          };

          const drawLine = (dy: number) => {
            ctx.save();
            ctx.beginPath();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1;
            ctx.moveTo(x + 8, dy + _wItem + 0.5);
            ctx.lineTo(x + _wItem - 8, dy + _wItem + 0.5);
            ctx.stroke();
            ctx.restore();
          };

          const itemDyes = dyes[item.guid];
          if (item.dye?.primary && itemDyes?.[0]) {
            drawDye(itemDyes[0]?.primary, x + 4, y + _wItem);
            drawDye(itemDyes[0]?.secondary, x + (_wDye - 4), y + _wItem);
          }
          if (item.dye?.secondary && itemDyes?.[1]) {
            drawLine(y + _wDye);
            drawDye(itemDyes[1]?.primary, x + 4, y + _wItem + _wDye);
            drawDye(itemDyes[1]?.secondary, x + (_wDye - 4), y + _wItem + _wDye);
          }
        }
      } else {
        drawPlaceholder();
        ctx.drawImage(imgUnknown, x, y, _wItem, _wItem);
      }
    });

    return canvas;
  }

  renderImage(mode: CopyImageMode): HTMLCanvasElement {
    const { items, imageLookup, iconLookup, imgSheets, selected, hidden, ongoingItems, showOngoing, hideIap, requesting } = this.opts;

    const cols = [10, 7, 5, 7];
    const canvas = document.createElement('canvas');

    const getItems = (type: ItemType) => items[type as string] || [];

    const cOutfit = Math.ceil(getItems(ItemType.Outfit).length / cols[0]);
    const cShoes = Math.ceil(getItems(ItemType.Shoes).length / cols[0]);
    const cOutfitShoes = Math.ceil(getItems(ItemType.OutfitShoes).length / cols[0]);
    const cMask = Math.ceil(getItems(ItemType.Mask).length / cols[0]);
    const cFaceAcc = Math.ceil(getItems(ItemType.FaceAccessory).length / cols[0]);
    const cNecklace = Math.ceil(getItems(ItemType.Necklace).length / cols[0]);
    const cHair = Math.ceil(getItems(ItemType.Hair).length / cols[1]);
    const cHairAcc = Math.ceil(getItems(ItemType.HairAccessory).length / cols[1]);
    const cHeadAcc = Math.ceil(getItems(ItemType.HeadAccessory).length / cols[1]);
    const cCape = Math.ceil(getItems(ItemType.Cape).length / cols[2]);
    const cHeld = Math.ceil(getItems(ItemType.Held).length / cols[3]);
    const cFurniture = Math.ceil(getItems(ItemType.Furniture).length / cols[3]);
    const cProp = Math.ceil(getItems(ItemType.Prop).length / cols[3]);

    const h1 = (cOutfit + cShoes + cOutfitShoes + cMask + cFaceAcc + cNecklace) * _wBox + _wPad * 7 - _wGap;
    const h2 = (cHair + cHairAcc + cHeadAcc) * _wBox + _wPad * 4 - _wGap;
    const h3 = cCape * _wBox + _wPad * 2 - _wGap;
    const h4 = (cHeld + cFurniture + cProp) * _wBox + _wPad * 4 - _wGap;
    const h = Math.max(h1, h2, h3, h4);

    canvas.width = 5 * _wPad + _wBox * cols.reduce((sum, c) => sum + c, 0) - _wGap;
    canvas.height = h === h4 ? h + 48 : h === h1 ? h : h + 24;
    const ctx = canvas.getContext('2d')!;
    this._drawBackground(ctx);

    const drawSection = (sx: number, sy: number, c: number, sItems: IItem[]) => {
      this._drawSection(ctx, sx, sy, c, mode, sItems, imageLookup, iconLookup, imgSheets, selected, hidden, ongoingItems, showOngoing, hideIap, requesting);
    };

    let sx = _wPad, sy = _wPad;
    drawSection(sx, sy, cols[0], getItems(ItemType.Outfit));
    sx = _wPad; sy = _wPad * 2 + cOutfit * _wBox;
    drawSection(sx, sy, cols[0], getItems(ItemType.Shoes));
    sx = _wPad; sy = _wPad * 3 + (cOutfit + cShoes) * _wBox;
    drawSection(sx, sy, cols[0], getItems(ItemType.OutfitShoes));
    sx = _wPad; sy = _wPad * 4 + (cOutfit + cShoes + cOutfitShoes) * _wBox;
    drawSection(sx, sy, cols[0], getItems(ItemType.Mask));
    sx = _wPad; sy = _wPad * 5 + (cOutfit + cShoes + cOutfitShoes + cMask) * _wBox;
    drawSection(sx, sy, cols[0], getItems(ItemType.FaceAccessory));
    sx = _wPad; sy = _wPad * 6 + (cOutfit + cShoes + cOutfitShoes + cMask + cFaceAcc) * _wBox;
    drawSection(sx, sy, cols[0], getItems(ItemType.Necklace));

    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad;
    drawSection(sx, sy, cols[1], getItems(ItemType.Hair));
    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad * 2 + cHair * _wBox;
    drawSection(sx, sy, cols[1], getItems(ItemType.HairAccessory));
    sx = _wPad * 2 + cols[0] * _wBox; sy = _wPad * 3 + (cHair + cHairAcc) * _wBox;
    drawSection(sx, sy, cols[1], getItems(ItemType.HeadAccessory));

    sx = _wPad * 3 + (cols[0] + cols[1]) * _wBox; sy = _wPad;
    drawSection(sx, sy, cols[2], getItems(ItemType.Cape));

    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad;
    drawSection(sx, sy, cols[3], getItems(ItemType.Held));
    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad * 2 + cHeld * _wBox;
    drawSection(sx, sy, cols[3], getItems(ItemType.Furniture));
    sx = _wPad * 4 + (cols[0] + cols[1] + cols[2]) * _wBox; sy = _wPad * 3 + (cHeld + cFurniture) * _wBox;
    drawSection(sx, sy, cols[3], getItems(ItemType.Prop));

    ctx.fillStyle = '#fff';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'right';
    let l1 = 'Icons by contributors of the Sky: Children of the Light Wiki';
    if (this.opts.bgAttribution) { l1 = `${this.opts.bgAttribution} | ${l1}`; }
    ctx.fillText(l1, canvas.width - 8, canvas.height - 8);
    ctx.fillText('© Sky: Children of the Light', canvas.width - 8, canvas.height - 8 - 24);

    return canvas;
  }

  private _drawBackground(ctx: CanvasRenderingContext2D): void {
    const { bgImg, bgFilter } = this.opts;
    const canvas = ctx.canvas;
    ctx.filter = bgFilter ?? 'blur(4px) brightness(0.6)';

    const imgAspect = bgImg.naturalWidth / bgImg.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;
    let drawWidth: number, drawHeight: number;

    if (imgAspect > canvasAspect) {
      drawHeight = canvas.height;
      drawWidth = bgImg.naturalWidth * (drawHeight / bgImg.naturalHeight);
    } else {
      drawWidth = canvas.width;
      drawHeight = bgImg.naturalHeight * (drawWidth / bgImg.naturalWidth);
    }

    const xn = canvas.width / 2 - drawWidth / 2;
    const yn = canvas.height / 2 - drawHeight / 2;
    ctx.drawImage(bgImg, 0, 0, bgImg.naturalWidth, bgImg.naturalHeight, xn - 10, yn - 10, drawWidth + 20, drawHeight + 20);
    ctx.filter = 'none';
  }

  private _drawSection(
    ctx: CanvasRenderingContext2D,
    sx: number, sy: number, c: number,
    mode: CopyImageMode,
    items: IItem[],
    imageLookup: (guid: string) => HTMLImageElement | null,
    iconLookup: (icon: string) => { file: string; x: number; y: number } | undefined,
    imgSheets: Record<string, HTMLImageElement>,
    selected: { all: ISelection; r: ISelection; y: ISelection; g: ISelection; b: ISelection },
    hidden: Record<string, boolean>,
    ongoingItems: Record<string, IItem>,
    showOngoing: boolean,
    hideIap: boolean,
    requesting: boolean
  ): void {
    let x = 0; let y = 0;
    const nextX = () => { if (++x >= c) { x = 0; y++; } };
    const h = Math.ceil(items.length / c);

    ctx.fillStyle = '#0008';
    ctx.beginPath(); ctx.roundRect(sx - _wGap, sy - _wGap, _wBox * c + _wGap, _wBox * h + _wGap, 8); ctx.fill();
    ctx.strokeStyle = '#0006'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(sx - _wGap, sy - _wGap, _wBox * c + _wGap, _wBox * h + _wGap, 8); ctx.stroke();

    for (const item of items) {
      if (!item.icon) { nextX(); continue; }
      const mappedIcon = iconLookup(item.icon);
      const img = imageLookup(item.guid);
      if (!mappedIcon && !img) { nextX(); continue; }

      ctx.fillStyle = '#0006';
      ctx.beginPath(); ctx.roundRect(sx + x * _wBox, sy + y * _wBox, _wItem, _wItem, 8); ctx.fill();

      if (mode !== 'template') {
        if (hideIap && item.iaps?.length && !selected.all[item.guid]) { ctx.globalAlpha = _aHide; }
        if (mode === 'request' && !selected.all[item.guid]) { ctx.globalAlpha = _aHide; }
        if (mode === 'closet' && hidden[item.guid]) {
          ctx.globalAlpha = selected.all[item.guid] || (showOngoing && ongoingItems[item.guid]) ? _aHalfHide : _aHide;
        }
      }

      if (mappedIcon) {
        const sheet = imgSheets[mappedIcon.file];
        ctx.drawImage(sheet, mappedIcon.x, mappedIcon.y, 128, 128, sx + x * _wBox, sy + y * _wBox, _wItem, _wItem);
      } else if (img) {
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, sx + x * _wBox, sy + y * _wBox, _wItem, _wItem);
      }
      ctx.globalAlpha = 1;

      if (selected.all[item.guid]) {
        ctx.lineWidth = 4;
        const selections: Array<{ c: string }> = [];
        if (selected.r[item.guid]) { selections.push({ c: '#f00' }); }
        if (selected.y[item.guid]) { selections.push({ c: '#ff0' }); }
        if (selected.g[item.guid]) { selections.push({ c: '#0f0' }); }
        if (selected.b[item.guid]) { selections.push({ c: '#0aa0ff' }); }
        if (selections.length > 1) {
          const offsetAngle = selections.length === 2 ? -Math.PI : selections.length === 3 ? 7 * Math.PI / 6 : Math.PI;
          const grad = ctx.createConicGradient(offsetAngle, sx + x * _wBox + _wItem / 2, sy + y * _wBox + _wItem / 2);
          for (let i = 0; i < selections.length; i++) {
            grad.addColorStop(i / selections.length, selections[i].c);
            grad.addColorStop((i + 1) / selections.length, selections[i].c);
          }
          ctx.strokeStyle = grad;
        } else {
          ctx.strokeStyle = selections[0].c;
        }
        ctx.beginPath(); ctx.roundRect(sx + x * _wBox, sy + y * _wBox, _wItem, _wItem, 8); ctx.stroke();
      }

      nextX();
    }
  }
}
