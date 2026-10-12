import { ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy, output, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { INavSection, NavigationService } from '@app/navigation/navigation.service';
import { SectionId } from '@app/navigation/pages';

export type NavTreeMode = 'full' | 'rail';

/** Lets the pointer cross the gap between a rail row and its flyout. */
const flyoutCloseDelay = 150;
const flyoutGap = 4;
const viewportMargin = 4;

/** The section list shared by the sidebar and the drawer. In the rail, section pages open in a flyout instead. */
@Component({
  selector: 'app-nav-tree',
  templateUrl: './nav-tree.component.html',
  styleUrl: './nav-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, MatIcon, TooltipDirective],
  host: {
    '[class.is-rail]': `mode() === 'rail'`
  }
})
export class NavTreeComponent implements OnDestroy {
  readonly nav = inject(NavigationService);

  readonly mode = input<NavTreeMode>('full');
  /** Emits when a link in the tree is followed. */
  readonly navigate = output<void>();

  readonly flyoutSection = signal<SectionId | null>(null);
  private _flyout?: HTMLElement;
  private _closeTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      this.nav.path();
      this.mode();
      untracked(() => this.closeFlyout());
    });
  }

  ngOnDestroy(): void {
    this.closeFlyout();
  }

  isExpanded(section: INavSection): boolean {
    return this.mode() === 'full' && section.pages.length > 0 && this.nav.expanded().has(section.id);
  }

  /** An open section passes the highlight to its active page, if one is listed. */
  isSectionActive(section: INavSection): boolean {
    if (this.nav.currentSection() !== section.id) { return false; }
    if (!this.isExpanded(section)) { return true; }
    const active = this.nav.activePages();
    return !section.pages.some(p => active.has(p.id));
  }

  onSectionClick(section: INavSection): void {
    if (this.mode() === 'full') { this.nav.expand(section.id); }
    this.navigate.emit();
  }

  onPageClick(): void {
    this.navigate.emit();
  }

  /** Native title only when the label is cut off, so short labels don't get a redundant tooltip. */
  showTitleIfTruncated(event: MouseEvent, label: string): void {
    const link = event.currentTarget as HTMLElement;
    const text = link.querySelector<HTMLElement>('.nav-tree__page-label');
    link.title = text && text.scrollWidth > text.clientWidth ? label : '';
  }

  openFlyout(section: INavSection, row: HTMLElement, flyout: HTMLElement): void {
    if (this.mode() !== 'rail' || !section.pages.length) { return; }
    this.cancelClose();
    if (this._flyout === flyout) { return; }

    this.closeFlyout();
    this._flyout = flyout;
    this.flyoutSection.set(section.id);
    flyout.showPopover();
    this.positionFlyout(row, flyout);
  }

  scheduleClose(): void {
    if (!this._flyout) { return; }
    this.cancelClose();
    this._closeTimer = setTimeout(() => this.closeFlyout(), flyoutCloseDelay);
  }

  onFocusOut(event: FocusEvent, item: HTMLElement): void {
    const next = event.relatedTarget as Node | null;
    if (next && item.contains(next)) { return; }
    this.closeFlyout();
  }

  onEscape(sectionLink: HTMLElement): void {
    if (!this._flyout) { return; }
    this.closeFlyout();
    sectionLink.focus();
  }

  closeFlyout(): void {
    this.cancelClose();
    const flyout = this._flyout;
    if (!flyout) { return; }
    this._flyout = undefined;
    this.flyoutSection.set(null);
    try { flyout.hidePopover(); } catch { /* removed or already hidden */ }
  }

  private cancelClose(): void {
    if (!this._closeTimer) { return; }
    clearTimeout(this._closeTimer);
    this._closeTimer = undefined;
  }

  /** The flyout sits in the top layer, so it is placed in viewport coordinates next to its row. */
  private positionFlyout(row: HTMLElement, flyout: HTMLElement): void {
    const anchor = row.getBoundingClientRect();
    const box = flyout.getBoundingClientRect();
    const left = Math.min(anchor.right + flyoutGap, window.innerWidth - box.width - viewportMargin);
    const top = Math.max(viewportMargin, Math.min(anchor.top, window.innerHeight - box.height - viewportMargin));
    flyout.style.left = `${Math.max(viewportMargin, left)}px`;
    flyout.style.top = `${top}px`;
  }
}
