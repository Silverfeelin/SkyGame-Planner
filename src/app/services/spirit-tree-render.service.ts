import { Injectable } from '@angular/core';
import { CostHelper } from '@app/helpers/cost-helper';
import { NodeHelper } from '@app/helpers/node-helper';
import { ICost } from '@app/interfaces/cost.interface';
import { INode } from '@app/interfaces/node.interface';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';

interface RenderOptions {
  title?: string;
  subtitle?: string;
  background?: boolean | string;
}

@Injectable({
  providedIn: 'root'
})
export class SpiritTreeRenderService {
  constructor(
  ) {}

  async render(tree: ISpiritTree, options: RenderOptions): Promise<HTMLCanvasElement> {
    const nodes = NodeHelper.all(tree.node);
    const cost = CostHelper.add(CostHelper.create(), ...nodes);
    const hasCost = !CostHelper.isEmpty(cost);
    const wCost = 24;
    const wGapX = 32;
    const wGapY = 40 + 18; // 24 is cost height, can probably reduce it.
    const wItem = 64;
    const wLine = 24;
    const wOffsetSide = 48;
    const wPadding = 10;
    const hCredit = 6;
    let hFooter = 0;
    if (options.title?.length) { hFooter += 32 + 2; }
    if (options.subtitle?.length) { hFooter += 32 + 2; }
    if (hasCost) { hFooter += 32 + 2; }
    if (hFooter) { hFooter -= 2; }

    const calculateHeight = (h: number, node?: INode): number => {
      if (!node) { return 0; }
      return Math.max(h, calculateHeight(h + wOffsetSide, node.nw), calculateHeight(h + wOffsetSide, node.ne), calculateHeight(h + wItem + wGapY, node.n));
    }

    const hasRootCost = tree.node && !CostHelper.isEmpty(tree.node);
    const width = wItem * 3 + wGapX * 2 + wPadding * 2;
    const height = calculateHeight(64, tree.node) + wPadding * 2 + (hasRootCost ? wCost : 0) + hCredit + hFooter;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) { throw new Error('Failed to render image; no canvas context.'); }
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    const loadImage = (url: string): Promise<{ url: string, img: HTMLImageElement}> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ url, img });
        img.onerror = reject;
        img.src = url;
      });
    };

    let imageUrlBackground = '';
    if (options.background === true) {
      imageUrlBackground = getComputedStyle(document.body).getPropertyValue('--background').match(/url\(([^)]+)\)/)?.[1] || '';
    } else if (typeof options.background === 'string') {
      imageUrlBackground = options.background;
    }
    if (options.background !== false) {
      imageUrlBackground ||= '/assets/game/background/peaks.webp';
    }

    const imageUrlC = '/assets/game/icons/candle.png';
    const imageUrlH = '/assets/game/icons/heart.png';
    const imageUrlSc = '/assets/game/icons/season-candle.png';
    const imageUrlSh = '/assets/game/icons/season-heart.png';
    const imageUrlAc = '/assets/game/icons/ascended-candle.png';
    const imageUrlEc = '/assets/game/icons/ticket.png';
    const imageSeason = nodes.some(n => (n.item?.group === 'SeasonPass' || n.item?.group === 'Ultimate') && CostHelper.isEmpty(n))
      && tree.spirit?.season?.iconUrl || '';
    const imageUrls: Array<string> = [
      imageUrlBackground, imageSeason, imageUrlC, imageUrlH, imageUrlSc, imageUrlSh, imageUrlAc, imageUrlEc,
      ...new Set(nodes.map(n => n.item?.icon).filter(v => v) as Array<string>)
    ].filter(v => v);
    const images = await Promise.all(imageUrls.map(loadImage));
    const imageMap = new Map<string, HTMLImageElement>(images.map(v => [v.url, v.img]));

    /** Draws the background with a blur effect. */
    if (imageUrlBackground) {
      ctx.filter = 'blur(4px) brightness(0.6)';
      const img = imageMap.get(imageUrlBackground)!;
      const imgAspectRatio = img.naturalWidth / img.naturalHeight;
      const canvasAspectRatio = canvas.width / canvas.height;

      let drawWidth, drawHeight;
      if (imgAspectRatio > canvasAspectRatio) {
        drawHeight = canvas.height;
        drawWidth = img.naturalWidth * (drawHeight / img.naturalHeight);
      } else {
        drawWidth = canvas.width;
        drawHeight = img.naturalHeight * (drawWidth / img.naturalWidth);
      }

      const xn = canvas.width / 2 - drawWidth / 2;
      const yn = canvas.height / 2 - drawHeight / 2;

      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, xn - 10, yn - 10, drawWidth + 20, drawHeight + 20);
      ctx.filter = 'none';
    }

    /** Draws a line between nodes, based on the current node coordinates and a direction */
    const drawLine = (x: number, y: number, direction: 'nw'|'ne'|'n') => {
      let x2: number, y2: number;
      if (direction === 'nw') {
        x -= 2; y += 24;
        x2 = x - wLine; y2 = y - wLine;
      } else if (direction === 'ne') {
        x += 2 + wItem; y += 24;
        x2 = x + wLine; y2 = y - wLine;
      } else {
        x += wItem / 2; y -= 3;
        x2 = x; y2 = y - wLine;
      }

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    type CostRenderData = { text: string; image: string; textWidth: number };
    const getCostData = (cost: ICost): CostRenderData | undefined => {
      let text = '';
      let image = '';
      if (cost.c) {
        text = cost.c.toString(); image = imageUrlC;
      } else if (cost.h) {
        text = cost.h.toString(); image = imageUrlH;
      } else if (cost.sc) {
        text = cost.sc.toString(); image = imageUrlSc;
      } else if (cost.sh) {
        text = cost.sh.toString(); image = imageUrlSh;
      } else if (cost.ac) {
        text = cost.ac.toString(); image = imageUrlAc;
      } else if (cost.ec) {
        text = cost.ec.toString(); image = imageUrlEc;
      }

      if (!text) { return undefined; }
      ctx.save();
      ctx.font = '18px sans-serif';
      const textWidth = ctx.measureText(text).width;
      ctx.restore();
      return { text, image, textWidth };
    }

    const drawCost = (data: CostRenderData, x: number, y: number, bg: boolean) => {
      if (!data.text) { return; }
      x -= data.textWidth! / 2 + wCost / 2 + 2;

      if (bg) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 2, data.textWidth! + wCost + 8, wCost + 4, 8);
        ctx.fill();
      }

      ctx.font = '18px sans-serif';
      ctx.fillStyle = '#fff';
      const img = imageMap.get(data.image!)!;
      ctx.drawImage(img, x, y, wCost, wCost);
      ctx.fillText(data.text, x + wCost, y + 19); // y text offset
    }

    const drawSeason = (x: number, y: number) => {
      const img = imageMap.get(imageSeason);
      if (img) {
        ctx.drawImage(img, x - 4, y - 4, 32, 32);
      }
    }

    const drawLevel = (lvl: number, x: number, y: number) => {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Lv${lvl}`, x - 6, y + wItem - 2);
      ctx.restore();
    }

    const drawNode = (node: INode, x: number, y: number) => {
      if (node.nw) {
        drawNode(node.nw, x - wItem - wGapX, y - wOffsetSide);
        drawLine(x, y, 'nw');
      }
      if (node.ne) {
        drawNode(node.ne, x + wItem + wGapX, y - wOffsetSide);
        drawLine(x, y, 'ne');
      }
      if (node.n) {
        drawNode(node.n, x, y - wItem - wGapY);
        drawLine(x, y, 'n');
      }

      const img = imageMap.get(node.item?.icon || '');
      if (img) {
        const costData = getCostData(node);
        costData && drawCost(costData, x + wItem / 2, y + wItem + 2, true);
        ctx.drawImage(img, x, y, wItem, wItem);
      }

      if (node.item?.level) {
        drawLevel(node.item.level, x, y);
      }

      if (node.item?.group === 'SeasonPass' || node.item?.group === 'Ultimate') {
        drawSeason(x, y);
      }
    };

    // Node coordinates (top left corner).
    let x = wGapX + wItem + wPadding;
    let y = height - wPadding - wItem - (hasRootCost ? wCost : 0) - hFooter;
    tree.node && drawNode(tree.node, x, y);

    // Footer
    x = 0; y = height - hFooter;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y, canvas.width, hFooter);
    ctx.strokeStyle = '#fff8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, y + 32 + 1);
    ctx.lineTo(canvas.width - 16, y + 32 + 1);
    ctx.stroke();
    ctx.restore();

    // Draw name
    if (options.title) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.title, canvas.width / 2, y + 23);
      ctx.strokeStyle = '#fff8';
      ctx.beginPath(); ctx.moveTo(16, y + 32 + 1); ctx.lineTo(canvas.width - 16, y + 32 + 1); ctx.stroke();
      ctx.restore();
      y += 32 + 2;
    }

    if (options.subtitle) {
      ctx.save();
      ctx.fillStyle = '#ccc';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(options.subtitle, canvas.width / 2, y + 23);
      ctx.strokeStyle = '#fff8';
      ctx.beginPath(); ctx.moveTo(16, y + 32 + 1); ctx.lineTo(canvas.width - 16, y + 32 + 1); ctx.stroke();
      ctx.restore();
      y += 32 + 2;
    }

    // Draw cost
    if (hasCost) {
      y += 4;
      const costDatas: Array<CostRenderData | undefined> = [];
      if (cost.c) { costDatas.push(getCostData({ c: cost.c })); }
      if (cost.h) { costDatas.push(getCostData({ h: cost.h })); }
      if (cost.sc) { costDatas.push(getCostData({ sc: cost.sc })); }
      if (cost.sh) { costDatas.push(getCostData({ sh: cost.sh })); }
      if (cost.ac) { costDatas.push(getCostData({ ac: cost.ac })); }
      if (cost.ec) { costDatas.push(getCostData({ ec: cost.ec })); }
      const costDataWidth = costDatas.filter(c => c).reduce((acc, v) => acc + v!.textWidth + wCost + 8, 0);
      x = (canvas.width - costDataWidth) / 2;

      costDatas.forEach(costData => {
        costData && drawCost(costData, x + costData.textWidth! / 2 + wCost / 2, y, false);
        x += costData!.textWidth! + wCost + 8;
      });

      // Draw attribution text
      ctx.save();
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.fillText('Icons by contributors of the Sky: CotL Wiki', canvas.width - 3, 12);
      ctx.restore();
    }

    return canvas;
  }

  shareCanvas(canvas: HTMLCanvasElement, fileName: string): void {
    canvas.toBlob(blob => {
      if (!blob) { alert('Rendering canvas failed.'); return; }

      const data: ShareData = {
        files: [ new File([blob], fileName, { type: 'image/png' }) ]
      };

      if (!navigator.canShare(data)) { alert('Sharing is not supported on this device.'); return; }
      try { navigator.share(data); } catch { alert('Sharing failed.'); return; }
    });
  }

  copyCanvas(canvas: HTMLCanvasElement): void {
    canvas.toBlob(blob => {
      if (!blob) { alert('Rendering canvas failed.'); return; }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    });
  }
}
