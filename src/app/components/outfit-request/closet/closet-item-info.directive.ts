import { Directive, ElementRef, inject, OnDestroy } from '@angular/core';
import { IItem } from 'skygame-data';
import { ClosetStateService } from './closet-state.service';
import { getClosetItemInfo } from './closet-item-info';

const HOVER_DELAY = 300;
const LONG_PRESS_DELAY = 450;
const LONG_PRESS_SLOP = 10;
const TILE_SELECTOR = '[data-guid]';

/**
 * Shows the name and source of the item tile under the pointer: on hover with a mouse, on keyboard focus,
 * or on long-press with touch. A short tap still selects the item.
 *
 * Put this on a container rather than on each tile; the closet grid holds over a thousand of them.
 */
@Directive({
  selector: '[appClosetItemInfo]',
  standalone: true,
  host: {
    '(pointerover)': 'onPointerOver($event)',
    '(pointerout)': 'onPointerOut($event)',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp()',
    '(pointercancel)': 'cancelPress()',
    '(contextmenu)': 'onContextMenu($event)',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'hide()'
  }
})
export class ClosetItemInfoDirective implements OnDestroy {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _state = inject(ClosetStateService);

  private _popover?: HTMLElement;
  private _tile?: HTMLElement;
  private _hoverTimer?: ReturnType<typeof setTimeout>;
  private _pressTimer?: ReturnType<typeof setTimeout>;
  private _pressStart?: { x: number; y: number };
  private _pressShown = false;
  private _suppressClickUntil = 0;

  private readonly _onClickCapture = (evt: MouseEvent): void => {
    if (performance.now() > this._suppressClickUntil) { return; }
    evt.preventDefault();
    evt.stopPropagation();
  };
  private readonly _onDismiss = (): void => { this.hide(); };
  // The tile can be removed or hidden under the pointer without a pointerout, so check where the pointer went.
  private readonly _onDocumentPointerOver = (evt: PointerEvent): void => {
    if (evt.pointerType === 'mouse' && !this._findTile(evt.target)) { this.hide(); }
  };
  private readonly _onVisibilityChange = (): void => {
    if (document.hidden) { this.hide(); }
  };

  constructor() {
    // Capture phase so a long-press release doesn't also toggle the tile.
    this._host.nativeElement.addEventListener('click', this._onClickCapture, true);
  }

  ngOnDestroy(): void {
    this._host.nativeElement.removeEventListener('click', this._onClickCapture, true);
    this.cancelPress();
    this.hide();
  }

  onPointerOver(evt: PointerEvent): void {
    if (evt.pointerType !== 'mouse') { return; }
    const tile = this._findTile(evt.target);
    if (!tile || tile === this._tile) { return; }

    clearTimeout(this._hoverTimer);
    // Once a card is open, moving to the next tile swaps it without waiting.
    if (this._popover) {
      this._show(tile);
    } else {
      this._hoverTimer = setTimeout(() => {
        if (tile.isConnected && tile.matches(':hover')) { this._show(tile); }
      }, HOVER_DELAY);
    }
  }

  onPointerOut(evt: PointerEvent): void {
    if (evt.pointerType !== 'mouse') { return; }
    const from = this._findTile(evt.target);
    const to = this._findTile(evt.relatedTarget);
    if (from === to) { return; }
    clearTimeout(this._hoverTimer);
    if (!to) { this.hide(); }
  }

  onPointerDown(evt: PointerEvent): void {
    if (evt.pointerType !== 'touch') { return; }
    const tile = this._findTile(evt.target);
    this.cancelPress();
    if (!tile) { return; }

    this._pressStart = { x: evt.clientX, y: evt.clientY };
    this._pressTimer = setTimeout(() => {
      this._pressShown = true;
      this._show(tile);
      // The card stays until the next touch, since there is no pointer to leave the tile.
      document.addEventListener('pointerdown', this._onDismiss, { capture: true, once: true });
    }, LONG_PRESS_DELAY);
  }

  onPointerMove(evt: PointerEvent): void {
    if (!this._pressStart) { return; }
    const dx = evt.clientX - this._pressStart.x;
    const dy = evt.clientY - this._pressStart.y;
    if (dx * dx + dy * dy > LONG_PRESS_SLOP * LONG_PRESS_SLOP) { this.cancelPress(); }
  }

  onPointerUp(): void {
    if (this._pressShown) { this._suppressClickUntil = performance.now() + 600; }
    this.cancelPress();
  }

  cancelPress(): void {
    clearTimeout(this._pressTimer);
    this._pressTimer = undefined;
    this._pressStart = undefined;
    this._pressShown = false;
  }

  onContextMenu(evt: Event): void {
    if (this._pressTimer || this._pressShown) { evt.preventDefault(); }
  }

  onFocusIn(evt: FocusEvent): void {
    const tile = this._findTile(evt.target);
    // Taps and clicks focus result buttons too; only keyboard focus should open the card.
    if (tile?.matches(':focus-visible')) { this._show(tile); }
  }

  hide(): void {
    clearTimeout(this._hoverTimer);
    document.removeEventListener('pointerdown', this._onDismiss, { capture: true });
    document.removeEventListener('pointerover', this._onDocumentPointerOver, { capture: true });
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    window.removeEventListener('scroll', this._onDismiss, { capture: true });
    window.removeEventListener('blur', this._onDismiss);
    this._tile = undefined;
    const el = this._popover;
    if (!el) { return; }
    this._popover = undefined;
    try { el.hidePopover(); } catch { /* already hidden */ }
    el.remove();
  }

  private _findTile(target: EventTarget | null): HTMLElement | undefined {
    if (!(target instanceof Element)) { return undefined; }
    const tile = target.closest<HTMLElement>(TILE_SELECTOR);
    return tile && this._host.nativeElement.contains(tile) ? tile : undefined;
  }

  private _show(tile: HTMLElement): void {
    const item = this._state.itemMap()[tile.dataset['guid'] ?? ''];
    if (!item || item.order === -1) { return; }
    if (!tile.isConnected || !tile.getClientRects().length) { this.hide(); return; }

    const el = this._popover ?? document.createElement('div');
    if (!this._popover) {
      el.className = 'sky-tooltip closet-item-info';
      el.setAttribute('popover', 'manual');
      document.body.appendChild(el);
      el.showPopover();
      this._popover = el;
      // Leave events don't fire reliably when the tab or window loses focus, or the page scrolls under the pointer.
      document.addEventListener('pointerover', this._onDocumentPointerOver, { capture: true });
      document.addEventListener('visibilitychange', this._onVisibilityChange);
      window.addEventListener('scroll', this._onDismiss, { capture: true, passive: true });
      window.addEventListener('blur', this._onDismiss);
    }
    this._tile = tile;
    el.replaceChildren(...this._render(item));
    this._position(el, tile);
  }

  private _render(item: IItem): Node[] {
    const info = getClosetItemInfo(item);
    const name = document.createElement('div');
    name.className = 'closet-item-info__name';
    name.textContent = item.name;

    const list = document.createElement('dl');
    const rows: Array<[string, string | undefined]> = [
      ['Spirit', info.spirit?.name],
      ['Season', info.season?.shortName],
      ['Event', info.event?.name],
      ['Realm', info.season || info.event ? undefined : info.realm?.name],
      ['Unlock', info.unlock]
    ];
    for (const [label, value] of rows) {
      if (!value) { continue; }
      const dt = list.appendChild(document.createElement('dt'));
      dt.textContent = label;
      const dd = list.appendChild(document.createElement('dd'));
      dd.textContent = value;
    }

    return list.childElementCount ? [name, list] : [name];
  }

  private _position(el: HTMLElement, tile: HTMLElement): void {
    const host = tile.getBoundingClientRect();
    const tip = el.getBoundingClientRect();
    const gap = 8;

    let top = host.top - tip.height - gap;
    if (top < 4) { top = host.bottom + gap; }
    let left = host.left + host.width / 2 - tip.width / 2;

    left = Math.max(4, Math.min(left, window.innerWidth - tip.width - 4));
    top = Math.max(4, Math.min(top, window.innerHeight - tip.height - 4));

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }
}
