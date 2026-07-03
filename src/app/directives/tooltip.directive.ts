import { booleanAttribute, Directive, ElementRef, EmbeddedViewRef, inject, input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';

type TooltipPlacement = 'top' | 'bottom' | 'bottom-start' | 'auto';

/**
 * Lightweight tooltip directive built on the native HTML Popover API.
 *
 * Replaces `@ng-bootstrap`'s `NgbTooltip`. The tooltip element is appended to
 * `document.body` as a manual popover so it renders in the top layer, escaping
 * any card/overflow clipping (the old `container="body"` behaviour) without
 * extra z-index juggling.
 *
 * Default trigger: show on hover/focus, hide on leave/blur. Set `manual` to
 * disable the automatic triggers and drive it via `open()` / `close()` (exposed
 * through `exportAs: 'skyTooltip'`), e.g. for copy-feedback tooltips.
 */
@Directive({
  selector: '[skyTooltip]',
  exportAs: 'skyTooltip',
  standalone: true,
  host: {
    '(mouseenter)': 'onTrigger()',
    '(focus)': 'onTrigger()',
    '(mouseleave)': 'onUntrigger()',
    '(blur)': 'onUntrigger()',
  }
})
export class TooltipDirective implements OnDestroy {
  private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _vcr = inject(ViewContainerRef);

  /** Tooltip content — plain text or a template. An empty/nullish value suppresses the tooltip. */
  readonly text = input<string | TemplateRef<unknown> | null | undefined>('', { alias: 'skyTooltip' });
  /** Preferred placement relative to the host element. */
  readonly placement = input<TooltipPlacement>('top');
  /** Disable hover/focus triggers; show via open()/close() instead. */
  readonly manual = input(false, { transform: booleanAttribute });
  /** When set, open() auto-hides after this many milliseconds. */
  readonly closeDelay = input(0);

  private _popover?: HTMLElement;
  private _view?: EmbeddedViewRef<unknown>;
  private _closeTimer?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    this._hide();
  }

  onTrigger(): void {
    if (this.manual()) { return; }
    this._show();
  }

  onUntrigger(): void {
    if (this.manual()) { return; }
    this._hide();
  }

  /** Show the tooltip. Auto-hides after `closeDelay` ms when that is set. */
  open(): void {
    this._show();
    const delay = this.closeDelay();
    if (delay > 0) {
      this._closeTimer = setTimeout(() => this._hide(), delay);
    }
  }

  /** Hide the tooltip immediately. */
  close(): void {
    this._hide();
  }

  private _show(): void {
    if (this._popover) { return; }
    const content = this.text();
    if (content == null || content === '') { return; }

    const el = document.createElement('div');
    el.className = 'sky-tooltip';
    el.setAttribute('popover', 'manual');

    if (content instanceof TemplateRef) {
      this._view = this._vcr.createEmbeddedView(content);
      this._view.detectChanges();
      this._view.rootNodes.forEach(node => el.appendChild(node));
    } else {
      el.textContent = String(content);
    }

    document.body.appendChild(el);
    this._popover = el;

    el.showPopover();
    this._position();
  }

  private _hide(): void {
    if (this._closeTimer) {
      clearTimeout(this._closeTimer);
      this._closeTimer = undefined;
    }
    const el = this._popover;
    if (!el) { return; }
    this._popover = undefined;
    try { el.hidePopover(); } catch { /* already hidden */ }
    el.remove();
    if (this._view) {
      this._view.destroy();
      this._view = undefined;
    }
  }

  private _position(): void {
    const el = this._popover;
    if (!el) { return; }

    const host = this._host.nativeElement.getBoundingClientRect();
    const tip = el.getBoundingClientRect();
    const gap = 8;

    let placement = this.placement();
    if (placement === 'auto') {
      placement = host.top > tip.height + gap ? 'top' : 'bottom';
    }

    let top = 0;
    let left = 0;
    switch (placement) {
      case 'top':
        top = host.top - tip.height - gap;
        left = host.left + host.width / 2 - tip.width / 2;
        break;
      case 'bottom':
        top = host.bottom + gap;
        left = host.left + host.width / 2 - tip.width / 2;
        break;
      case 'bottom-start':
        top = host.bottom + gap;
        left = host.left;
        break;
    }

    // Keep the tooltip within the viewport.
    left = Math.max(4, Math.min(left, window.innerWidth - tip.width - 4));
    top = Math.max(4, Math.min(top, window.innerHeight - tip.height - 4));

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }
}
