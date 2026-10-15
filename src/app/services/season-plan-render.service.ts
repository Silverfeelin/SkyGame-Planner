import { Injectable } from '@angular/core';
import { INode } from 'skygame-data';

export type SeasonPlanNodeState = 'none' | 'marked' | 'awaiting' | 'owned';
export type SeasonPlanRailKind = 'items' | 'accompany' | 'selected' | 'needed';
export type SeasonPlanStarState = 'reached' | 'selected' | 'short' | 'none';

export interface SeasonPlanNode {
  node: INode;
  state: SeasonPlanNodeState;
  /** Friendship the node adds, shown while it isn't owned. */
  value?: number;
  valueMarked?: boolean;
  /** Accompany points on the tree, for the accompany node. */
  accompany?: number;
}

export interface SeasonPlanTier {
  rows: ReadonlyArray<ReadonlyArray<SeasonPlanNode | undefined>>;
  rail: ReadonlyArray<{ kind: SeasonPlanRailKind; bottom: number; height: number }>;
  star?: { points: number; state: SeasonPlanStarState; short: number; days: number };
}

export interface SeasonPlanTree {
  name: string;
  friendship: number;
  candlesMarked: number;
  accompanyDays: number;
  /** Top to bottom, the order they are drawn in. */
  tiers: ReadonlyArray<SeasonPlanTier>;
}

export interface SeasonPlan {
  season: string;
  seasonIcon?: string;
  daysLeft: number;
  upcoming: boolean;
  seasonPass: boolean;
  trees: ReadonlyArray<SeasonPlanTree>;
  candlesSpent: number;
  candlesRequired: number;
  candlesFinal: number;
  accompanyDays: number;
  accompanyDaysLeft: number;
}

const SCALE = 2;
const PADDING = 24;
const MIN_WIDTH = 960;
const HEADER_H = 96;
const TOTALS_H = 84;
const TREE_GAP = 12;
const TREE_PAD = 10;
const TREE_HEAD_H = 40;
const TREE_FOOT_H = 56;
const RAIL_COL = 28;
const RAIL_W = 10;
const CELL_W = 66;
const TILE_W = 62;
const TILE_H = 82;
const ICON = 50;
const ROW_H = 88;
const STAR_H = 26;
const TREE_W = TREE_PAD * 2 + RAIL_COL + CELL_W * 3;

const SPRITE_URL = '/assets/icons/icons.svg';
const BACKGROUND_URL = '/assets/game/background/peaks.webp';
const QUESTION_URL = '/assets/icons/question.webp';

/** CSS colour expressions, resolved against the optimizer so they follow the active theme. */
const COLOR_EXPRESSIONS = {
  text: 'var(--atmos-text)',
  dim: 'var(--atmos-text-dim)',
  mute: 'var(--atmos-text-mute)',
  accent: 'var(--atmos-accent)',
  warm: 'var(--atmos-warm)',
  good: 'var(--atmos-good)',
  bad: 'oklch(0.75 0.14 25)',
  seasonal: 'var(--atmos-seasonal)',
  currency: 'var(--atmos-currency)',
  lineSoft: 'var(--atmos-line-soft)',
  shadow: 'var(--atmos-overlay-shadow)',
  items: 'var(--optimizer-items)',
  accompany: 'var(--optimizer-accompany)',
  accompanyInk: 'oklch(0.25 0.05 93)',
  track: 'var(--optimizer-track)',
  markedBg: 'var(--optimizer-marked-bg)',
  markedBorder: 'var(--optimizer-marked-border)',
  awaitingBg: 'var(--optimizer-awaiting-bg)',
  ownedBg: 'var(--optimizer-owned-bg)',
  ownedBorder: 'var(--optimizer-owned-border)',
  selectedA: 'oklch(0.82 calc(0.11 * var(--atmos-chroma)) var(--atmos-hue) / 0.6)',
  selectedB: 'oklch(0.82 calc(0.11 * var(--atmos-chroma)) var(--atmos-hue) / 0.2)',
  neededA: 'oklch(0.78 0.13 65 / 0.75)',
  neededB: 'oklch(0.78 0.13 65 / 0.2)',
  badgeBg: 'oklch(0.16 0.03 var(--atmos-hue) / 0.92)',
  checkInk: 'oklch(0.18 calc(0.03 * var(--atmos-chroma)) var(--atmos-hue))'
};
type Colors = { [K in keyof typeof COLOR_EXPRESSIONS]: string };

@Injectable({ providedIn: 'root' })
export class SeasonPlanRenderService {
  /** `host` must carry the optimizer's `--optimizer-*` tokens. */
  async render(plan: SeasonPlan, host: HTMLElement): Promise<HTMLCanvasElement> {
    const colors = resolveColors(host);
    const font = getComputedStyle(document.body).fontFamily || 'sans-serif';

    const perRow = plan.trees.length <= 4 ? plan.trees.length : Math.ceil(plan.trees.length / 2);
    const treeRows = Math.ceil(plan.trees.length / Math.max(1, perRow));
    const treesW = perRow * TREE_W + (perRow - 1) * TREE_GAP;
    const width = Math.max(MIN_WIDTH, treesW + PADDING * 2);
    const treeH = Math.max(0, ...plan.trees.map(t => TREE_HEAD_H + TREE_FOOT_H
      + t.tiers.reduce((sum, tier) => sum + (tier.star ? STAR_H : 0) + tier.rows.length * ROW_H, 0)));
    const height = HEADER_H + treeRows * (treeH + TREE_GAP) + TOTALS_H - 12 + PADDING;

    const canvas = document.createElement('canvas');
    canvas.width = width * SCALE;
    canvas.height = height * SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) { throw new Error('Failed to render image; no canvas context.'); }
    ctx.scale(SCALE, SCALE);

    // #region Images

    const background = getComputedStyle(document.body).getPropertyValue('--atmos-bg-image').match(/url\(['"]?([^'")\s]+)['"]?\)/)?.[1] || BACKGROUND_URL;
    const nodes = plan.trees.flatMap(t => t.tiers.flatMap(tier => tier.rows.flat())).filter(n => n) as SeasonPlanNode[];
    const urls = new Set([background, plan.seasonIcon, ...nodes.map(n => n.node.item?.icon || QUESTION_URL)].filter(u => u) as string[]);
    const images = new Map<string, HTMLImageElement>();
    // A missing icon shouldn't fail the whole export.
    await Promise.all([...urls].map(url => loadImage(url).then(img => images.set(url, img), () => undefined)));

    const sprite = await fetch(SPRITE_URL).then(r => r.text()).then(t => new DOMParser().parseFromString(t, 'image/svg+xml')).catch(() => undefined);
    const spriteImages = new Map<string, HTMLImageElement>();
    const spriteKey = (id: string, color: string) => `${id}|${color}`;
    const spriteIcons: Array<[string, string]> = [
      ['season-candle', colors.seasonal], ['heart', colors.seasonal], ['heart', colors.currency],
      ['ascended-candle', colors.currency], ['ticket', colors.currency], ['candle', colors.currency],
      ['gift', colors.seasonal], ['season-heart', colors.seasonal]
    ];
    await Promise.all(spriteIcons.map(([id, color]) => {
      const symbol = sprite?.getElementById(id);
      if (!symbol) { return undefined; }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol.getAttribute('viewBox')}" fill="${color}">${symbol.innerHTML}</svg>`;
      return loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
        .then(img => spriteImages.set(spriteKey(id, color), img), () => undefined);
    }));

    // #endregion

    // #region Primitives

    const setFont = (size: number, weight = 400) => ctx.font = `${weight} ${size}px ${font}`;
    const text = (value: string, x: number, y: number, align: CanvasTextAlign = 'left', color = colors.text) => {
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.fillText(value, x, y);
      return ctx.measureText(value).width;
    };
    const roundRect = (x: number, y: number, w: number, h: number, r: number, fill?: string, stroke?: string) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    };
    const panel = (x: number, y: number, w: number, h: number) => roundRect(x, y, w, h, 12, 'rgba(0, 0, 0, 0.35)');
    const image = (url: string | undefined, x: number, y: number, size: number) => {
      const img = url && images.get(url);
      img && ctx.drawImage(img, x, y, size, size);
    };
    const spriteIcon = (id: string, color: string, x: number, y: number, size: number) => {
      const img = spriteImages.get(spriteKey(id, color));
      img && ctx.drawImage(img, x, y, size, size);
    };
    const stripes = (x: number, y: number, w: number, h: number, a: string, b: string) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.fillStyle = b;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = a;
      ctx.lineWidth = 3;
      for (let d = -h; d < w + h; d += 6 * Math.SQRT2) {
        ctx.beginPath();
        ctx.moveTo(x + d, y + h);
        ctx.lineTo(x + d + h, y);
        ctx.stroke();
      }
      ctx.restore();
    };
    const railFill = (kind: SeasonPlanRailKind, x: number, y: number, w: number, h: number) => {
      switch (kind) {
        case 'items': ctx.fillStyle = colors.items; ctx.fillRect(x, y, w, h); break;
        case 'accompany': ctx.fillStyle = colors.accompany; ctx.fillRect(x, y, w, h); break;
        case 'selected': stripes(x, y, w, h, colors.selectedA, colors.selectedB); break;
        case 'needed': stripes(x, y, w, h, colors.neededA, colors.neededB); break;
      }
    };
    const star = (cx: number, cy: number, r: number, color: string) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 ? r * 0.45 : r;
        const angle = -Math.PI / 2 + i * Math.PI / 5;
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };
    const pill = (value: string, right: number, top: number, bg: string, color: string) => {
      setFont(11, 700);
      const w = ctx.measureText(value).width + 10;
      roundRect(right - w, top, w, 16, 8, bg);
      text(value, right - w / 2, top + 12, 'center', color);
    };
    const nodeMarker = (state: SeasonPlanNodeState): [string?, string?] => {
      switch (state) {
        case 'marked': return [colors.markedBg, colors.markedBorder];
        case 'awaiting': return [colors.awaitingBg];
        case 'owned': return [colors.ownedBg, colors.ownedBorder];
        default: return [];
      }
    };

    // #endregion

    // #region Background

    const bg = images.get(background);
    if (bg) {
      const scale = Math.max(width / bg.naturalWidth, height / bg.naturalHeight);
      const w = bg.naturalWidth * scale, h = bg.naturalHeight * scale;
      ctx.filter = 'blur(4px) brightness(0.5)';
      ctx.drawImage(bg, (width - w) / 2 - 10, (height - h) / 2 - 10, w + 20, h + 20);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#1d2433';
      ctx.fillRect(0, 0, width, height);
    }

    // #endregion

    // #region Header

    let y = PADDING;
    const titleX = plan.seasonIcon && images.has(plan.seasonIcon) ? PADDING + 54 : PADDING;
    image(plan.seasonIcon, PADDING, y, 46);
    setFont(26, 600);
    text(`My ${plan.season} plan`, titleX, y + 22);
    setFont(15);
    const daysLeft = `${plan.daysLeft} ${plan.daysLeft === 1 ? 'day' : 'days'} left in the season`;
    const daysLeftW = text(daysLeft, titleX, y + 44, 'left', colors.dim);
    if (plan.seasonPass) {
      const passX = titleX + daysLeftW + ctx.measureText(' · ').width;
      text(' · ', titleX + daysLeftW, y + 44, 'left', colors.dim);
      spriteIcon('gift', colors.seasonal, passX, y + 31, 16);
      text('Season Pass', passX + 19, y + 44, 'left', colors.seasonal);
    }

    setFont(11);
    text('Item icons by contributors of the Sky: CotL Wiki', width - PADDING, y + 4, 'right', '#fff');

    // Legend, laid out right to left. Items and the friendship bar get their own row and swatch shape.
    let lx = width - PADDING;
    const legendItem = (label: string, ly: number, swatch?: (x: number, y: number) => void) => {
      setFont(12, swatch ? 400 : 600);
      lx -= ctx.measureText(label).width;
      text(label, lx, ly + 10, 'left', swatch ? colors.dim : colors.text);
      if (swatch) {
        lx -= 20;
        swatch(lx, ly);
      }
      lx -= 14;
    };
    const tile = (fill: string, border: string, dashed = false) => (x: number, ly: number) => {
      ctx.save();
      if (dashed) { ctx.setLineDash([3, 2]); }
      roundRect(x, ly - 1, 14, 14, 3, fill, border);
      ctx.restore();
    };
    const bar = (draw: (x: number, y: number, w: number, h: number) => void) => (x: number, ly: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 3, ly - 2, 8, 16, 4);
      ctx.clip();
      draw(x + 3, ly - 2, 8, 16);
      ctx.restore();
    };
    const legendTop = y + 16;
    legendItem('Needs more friendship', legendTop, tile(colors.awaitingBg, colors.accent, true));
    legendItem('Planned', legendTop, tile(colors.markedBg, colors.markedBorder));
    legendItem('Owned', legendTop, tile(colors.ownedBg, colors.ownedBorder));
    legendItem('Items', legendTop);
    lx = width - PADDING;
    legendItem('Still needed', legendTop + 24, bar((x, by, w, h) => stripes(x, by, w, h, colors.neededA, colors.neededB)));
    legendItem('From planned items', legendTop + 24, bar((x, by, w, h) => stripes(x, by, w, h, colors.selectedA, colors.selectedB)));
    legendItem('From accompanying', legendTop + 24, bar((x, by, w, h) => railFill('accompany', x, by, w, h)));
    legendItem('From owned items', legendTop + 24, bar((x, by, w, h) => railFill('items', x, by, w, h)));
    legendItem('Friendship', legendTop + 24);
    y = HEADER_H;

    // #endregion

    // #region Trees

    const drawNode = (entry: SeasonPlanNode, x: number, y: number) => {
      const node = entry.node;
      const [fill, border] = nodeMarker(entry.state);
      if (fill) { roundRect(x + 0.5, y + 0.5, TILE_W - 1, TILE_H - 1, 6, fill, border); }
      if (entry.state === 'awaiting') {
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.lineWidth = 1;
        roundRect(x + 0.5, y + 0.5, TILE_W - 1, TILE_H - 1, 6);
        ctx.strokeStyle = colors.accent;
        ctx.stroke();
        ctx.restore();
      }

      const ix = x + (TILE_W - ICON) / 2, iy = y + 6;
      image(node.item?.icon || QUESTION_URL, ix, iy, ICON);

      const group = node.item?.group;
      if (group === 'SeasonPass') { spriteIcon('gift', colors.seasonal, ix + 1, iy + 1, 15); }
      else if (group === 'Ultimate') { spriteIcon('season-heart', colors.seasonal, ix + 1, iy + 1, 15); }

      if (node.item?.level) {
        ctx.save();
        ctx.shadowColor = colors.shadow;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        setFont(11, 600);
        text(`Lv${node.item.level}`, ix, iy + ICON - 2);
        ctx.restore();
      }

      if (entry.state === 'owned') {
        const cx = ix + ICON - 3 - 8, cy = iy + ICON - 3 - 8;
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = colors.shadow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = colors.good;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + 0.5);
        ctx.lineTo(cx - 1.5, cy + 3);
        ctx.lineTo(cx + 4, cy - 3);
        ctx.strokeStyle = colors.checkInk;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      const cost = nodeCost(node, colors);
      if (cost) {
        setFont(13, 700);
        const label = `${cost.amount}`;
        const w = 16 + 2 + ctx.measureText(label).width;
        spriteIcon(cost.icon, cost.color, x + (TILE_W - w) / 2, iy + ICON + 6, 16);
        text(label, x + (TILE_W - w) / 2 + 18, iy + ICON + 19);
      } else if (entry.accompany !== undefined) {
        setFont(13, 700);
        text(`+${entry.accompany}`, x + TILE_W / 2, iy + ICON + 19, 'center', colors.accompany);
      }

      if (entry.accompany) {
        pill(`×${entry.accompany / 10}`, x + TILE_W + 4, y - 4, colors.accompany, colors.accompanyInk);
      } else if (entry.value) {
        pill(`+${entry.value}`, x + TILE_W + 4, y - 4, colors.badgeBg, entry.valueMarked ? colors.accent : colors.dim);
      }
    };

    const drawStar = (tier: SeasonPlanTier, tx: number, sy: number) => {
      const s = tier.star!;
      const color = { reached: colors.accompany, selected: colors.accent, short: colors.warm, none: colors.mute }[s.state];
      const railX = tx + TREE_PAD + RAIL_COL / 2;
      star(railX, sy + STAR_H / 2, 11, color);

      const labelX = tx + TREE_PAD + RAIL_COL + 4;
      const labelEnd = tx + TREE_W - TREE_PAD;
      const suffix = { reached: ' · reached', selected: ' · with planned items', none: '',
        short: ` · ${Math.round(s.short)} short · ${s.days} ${s.days === 1 ? 'day' : 'days'}` }[s.state];
      setFont(12, 700);
      let x = labelX + text(`${s.points}`, labelX, sy + 17, 'left', color);
      setFont(12, s.state === 'short' ? 600 : 400);
      x += text(fitText(ctx, suffix, labelEnd - x - 12), x, sy + 17, 'left', color);

      ctx.save();
      const dashed = s.state === 'selected' || s.state === 'short';
      if (dashed) { ctx.setLineDash([4, 4]); ctx.globalAlpha = 0.6; }
      ctx.strokeStyle = dashed ? color : colors.lineSoft;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 6, sy + STAR_H / 2 + 0.5);
      ctx.lineTo(labelEnd, sy + STAR_H / 2 + 0.5);
      ctx.stroke();
      ctx.restore();
    };

    plan.trees.forEach((tree, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, plan.trees.length - row * perRow);
      const rowW = inRow * TREE_W + (inRow - 1) * TREE_GAP;
      const tx = (width - rowW) / 2 + (i % perRow) * (TREE_W + TREE_GAP);
      const ty = y + row * (treeH + TREE_GAP);
      panel(tx, ty, TREE_W, treeH);

      setFont(17, 600);
      text(fitText(ctx, tree.name, TREE_W - TREE_PAD * 2 - 80), tx + TREE_PAD + 2, ty + 26);
      setFont(13);
      const total = ` / 280`;
      const totalW = text(total, tx + TREE_W - TREE_PAD - 2, ty + 26, 'right', colors.dim);
      setFont(15, 700);
      text(`${tree.friendship}`, tx + TREE_W - TREE_PAD - 2 - totalW, ty + 26, 'right');

      // Trees are top-aligned so the stars of every tree line up.
      let sy = ty + TREE_HEAD_H;
      for (const tier of tree.tiers) {
        if (tier.star) {
          drawStar(tier, tx, sy);
          sy += STAR_H;
        }

        const tierH = tier.rows.length * ROW_H;
        if (tier.star) {
          const rx = tx + TREE_PAD + RAIL_COL / 2 - RAIL_W / 2;
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(rx, sy, RAIL_W, tierH, RAIL_W / 2);
          ctx.clip();
          ctx.fillStyle = colors.track;
          ctx.fillRect(rx, sy, RAIL_W, tierH);
          tier.rail.forEach(layer => {
            const lh = layer.height / 100 * tierH;
            railFill(layer.kind, rx, sy + tierH - layer.bottom / 100 * tierH - lh, RAIL_W, lh);
          });
          ctx.restore();
        }

        tier.rows.forEach((nodes, iRow) => {
          nodes.forEach((n, iCol) => {
            if (!n) { return; }
            const nx = tx + TREE_PAD + RAIL_COL + iCol * CELL_W + (CELL_W - TILE_W) / 2;
            drawNode(n, nx, sy + iRow * ROW_H + (ROW_H - TILE_H) / 2);
          });
        });
        sy += tierH;
      }

      const fy = ty + treeH - TREE_FOOT_H;
      ctx.fillStyle = colors.lineSoft;
      ctx.fillRect(tx + TREE_PAD, fy + 4, TREE_W - TREE_PAD * 2, 1);
      setFont(13);
      text('Planned items', tx + TREE_PAD + 2, fy + 24, 'left', colors.dim);
      text('Accompany', tx + TREE_PAD + 2, fy + 44, 'left', colors.dim);
      const right = tx + TREE_W - TREE_PAD - 2;
      setFont(13, 700);
      const markedW = text(`${tree.candlesMarked}`, right, fy + 24, 'right');
      spriteIcon('season-candle', colors.seasonal, right - markedW - 18, fy + 11, 16);
      text(tree.accompanyDays ? `${tree.accompanyDays} ${tree.accompanyDays === 1 ? 'day' : 'days'}` : '—',
        right, fy + 44, 'right', tree.accompanyDays ? colors.accompany : colors.mute);
    });
    y += treeRows * (treeH + TREE_GAP);

    // #endregion

    // #region Totals

    const innerW = width - PADDING * 2;
    const tileW = (innerW - 24) / 4;
    const tiles: Array<{ label: string; value: string; sub?: string; bad?: boolean; withIcon?: boolean }> = [
      { label: 'Season candles spent', value: `${plan.candlesSpent}`, withIcon: true },
      { label: 'Season candles to spend', value: `${plan.candlesRequired}`, withIcon: true },
      { label: 'Converted at the end of the season', value: `${plan.candlesFinal}`, bad: plan.candlesFinal < 0, withIcon: true },
      { label: 'Days of accompanying required', value: `${plan.accompanyDays}`, sub: ` of ${plan.accompanyDaysLeft}`, bad: plan.accompanyDays > plan.accompanyDaysLeft }
    ];
    tiles.forEach((tile, i) => {
      const x = PADDING + i * (tileW + 8);
      panel(x, y, tileW, TOTALS_H - 12);
      setFont(13);
      text(tile.label, x + 14, y + 24, 'left', colors.dim);
      let vx = x + 14;
      if (tile.withIcon) { spriteIcon('season-candle', colors.seasonal, vx, y + 34, 26); vx += 30; }
      setFont(26, 600);
      const w = text(tile.value, vx, y + 57, 'left', tile.bad ? colors.bad : colors.text);
      if (tile.sub) {
        setFont(15);
        text(tile.sub, vx + w, y + 57, 'left', colors.dim);
      }
    });
    // #endregion

    return canvas;
  }

  downloadCanvas(canvas: HTMLCanvasElement, fileName: string): void {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

/** Matches the cost shown under a node on the page. */
function nodeCost(node: INode, colors: Colors): { icon: string; amount: number; color: string } | undefined {
  if (node.h) { return { icon: 'heart', amount: node.h, color: colors.currency }; }
  if (node.sc) { return { icon: 'season-candle', amount: node.sc, color: colors.seasonal }; }
  if (node.sh) { return { icon: 'heart', amount: node.sh, color: colors.seasonal }; }
  if (node.ac) { return { icon: 'ascended-candle', amount: node.ac, color: colors.currency }; }
  if (node.ec) { return { icon: 'ticket', amount: node.ec, color: colors.currency }; }
  if (node.c) { return { icon: 'candle', amount: node.c, color: colors.currency }; }
  return undefined;
}

/** Lets the browser resolve tokens and relative colours, which canvas can't read from `var()`. */
function resolveColors(host: HTMLElement): Colors {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  host.appendChild(probe);
  try {
    return Object.fromEntries(Object.entries(COLOR_EXPRESSIONS).map(([key, expression]) => {
      probe.style.color = '';
      probe.style.color = expression;
      return [key, getComputedStyle(probe).color];
    })) as Colors;
  } finally {
    probe.remove();
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function fitText(ctx: CanvasRenderingContext2D, value: string, maxWidth: number): string {
  if (ctx.measureText(value).width <= maxWidth) { return value; }
  let end = value.length;
  while (end > 0 && ctx.measureText(`${value.slice(0, end)}…`).width > maxWidth) { end--; }
  return end ? `${value.slice(0, end)}…` : '';
}
