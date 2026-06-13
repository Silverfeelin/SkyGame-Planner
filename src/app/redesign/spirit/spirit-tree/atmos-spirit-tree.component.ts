import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, output, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DateTime } from 'luxon';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AtmosNodeAction, AtmosNodeComponent } from '../node/atmos-node.component';
import { AtmosDraftWarningComponent } from '@app/redesign/shared/draft-warning/atmos-draft-warning.component';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { DateComponent } from '@app/components/util/date/date.component';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CostHelper } from '@app/helpers/cost-helper';
import { NodeHelper } from '@app/helpers/node-helper';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { NodeService } from '@app/services/node.service';
import { CurrencyService } from '@app/services/currency.service';
import { DebugService } from '@app/services/debug.service';
import { SpiritTreeRenderService } from '@app/services/spirit-tree-render.service';
import { cancellableEvent, noInputs } from '@app/rxjs/operators';
import { INode, ISpiritTree, ISpiritTreeTier, ICost, IItem } from 'skygame-data';

export interface AtmosSpiritTreeNodeClickEvent {
  node: INode;
  event: MouseEvent;
}

interface AtmosTreeRow {
  left?: INode;
  center?: INode;
  right?: INode;
}

interface AtmosTreeColumns {
  left: (INode | undefined)[];
  center: (INode | undefined)[];
  right: (INode | undefined)[];
}

type ShareMode = 'share' | 'clipboard';

/**
 * Page-wide node action shared by every tree on the page. Toggling the action
 * on one tree's control bar (or via the `u` / `n` keyboard shortcuts) switches
 * them all at once — matching the legacy `signalAction` behaviour.
 */
const sharedNodeAction = signal<AtmosNodeAction>('unlock');

/**
 * Atmospheric spirit-tree renderer. Lays the tree out as a vertical stack of
 * 3-column rows, delegating each node to `AtmosNodeComponent`.
 *
 * Owns the full legacy `SpiritTreeComponent` behaviour: the unlock/navigate
 * click pipeline, the in-widget control bar (action toggle + unlock-all / image
 * export / edit menu) behind `enableControls`, and the page-wide `u` / `n`
 * keyboard shortcuts.
 */
@Component({
  selector: 'app-atmos-spirit-tree',
  templateUrl: './atmos-spirit-tree.component.html',
  styleUrl: './atmos-spirit-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmosNodeComponent, CostComponent, DateComponent, MatIcon, AtmosDraftWarningComponent]
})
export class AtmosSpiritTreeComponent {
  readonly tree = input.required<ISpiritTree>();
  readonly name = input<string | undefined>(undefined);
  readonly highlight = input<boolean>(false);
  readonly highlightItem = input<string | ReadonlyArray<string> | undefined>(undefined);
  readonly highlightNode = input<string | ReadonlyArray<string> | undefined>(undefined);
  readonly enableControls = input<boolean>(true);
  readonly enableNavigation = input<boolean>(true);
  readonly showNodeTooltips = input<boolean>(true);
  readonly opaqueNodes = input<boolean | ReadonlyArray<string> | undefined>(undefined);
  readonly padBottom = input<boolean>(false);
  readonly forceNodeAction = input<AtmosNodeAction | undefined>(undefined);
  readonly nodeOverlayTemplate = input<TemplateRef<unknown> | undefined>(undefined);

  readonly nodeClicked = output<AtmosSpiritTreeNodeClickEvent>();

  private readonly _elementRef = inject(ElementRef);
  private readonly _router = inject(Router);
  private readonly _eventService = inject(EventService);
  private readonly _storageService = inject(StorageService);
  private readonly _nodeService = inject(NodeService);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _debugService = inject(DebugService);
  private readonly _renderService = inject(SpiritTreeRenderService);

  /** Bumped on `itemToggled` so cost computeds re-run after in-place unlock mutations. */
  private readonly _refresh = signal(0);

  /** Whether the overflow menu (image export / edit) is expanded. */
  readonly showMenu = signal(false);

  constructor() {
    this._eventService.itemToggled.pipe(takeUntilDestroyed()).subscribe(() => {
      this._refresh.update(v => v + 1);
    });

    // Close the more-actions dropdown when clicking outside the menu container.
    this._eventService.clicked.pipe(takeUntilDestroyed()).subscribe(event => {
      if (!this.showMenu()) { return; }
      const menu = (this._elementRef.nativeElement as HTMLElement).querySelector('.atmos-spirit-tree__menu');
      if (!menu || !menu.contains(event.target as Node)) {
        this.showMenu.set(false);
      }
    });

    // Page-wide u / n shortcuts. Skipped for forced-action (emit) trees and
    // when controls are disabled, mirroring legacy.
    this._eventService.keydown.pipe(takeUntilDestroyed(), cancellableEvent(), noInputs()).subscribe(evt => {
      if (this.forceNodeAction() || !this.enableControls()) { return; }
      if (evt.shiftKey || evt.ctrlKey || evt.altKey || evt.metaKey) { return; }

      let action: AtmosNodeAction | undefined;
      switch (evt.key?.toLocaleLowerCase()) {
        case 'n': action = 'navigate'; break;
        case 'u': action = 'unlock'; break;
        default: return;
      }

      if (sharedNodeAction() === action) { action = 'unlock'; }
      sharedNodeAction.set(action);
      evt.preventDefault();
    });
  }

  readonly visibleName = computed<string | undefined>(() => {
    const t = this.tree();
    return this.name()
      ?? t.name
      ?? t.eventInstanceSpirit?.name
      ?? t.eventInstanceSpirit?.spirit?.name
      ?? t.travelingSpirit?.spirit?.name
      ?? t.specialVisitSpirit?.spirit?.name
      ?? t.spirit?.name;
  });

  readonly rows = computed<ReadonlyArray<AtmosTreeRow>>(() => {
    const t = this.tree();
    const rows: AtmosTreeRow[] = [];

    if (t.node) {
      // Walk the node chain bottom (root) → top.
      const buildRows = (n: INode, dir: number, level: number) => {
        const row = rows[level] ?? (rows[level] = {});
        if (dir < 0) { row.left = n; }
        else if (dir > 0) { row.right = n; }
        else { row.center = n; }
        if (n.nw) { buildRows(n.nw, dir - 1, level); }
        if (n.ne) { buildRows(n.ne, dir + 1, level); }
        if (n.n) { buildRows(n.n, dir, level + 1); }
      };
      buildRows(t.node, 0, 0);
      // Reverse so the root is at the bottom visually.
      return rows.slice().reverse();
    } else if (t.tier) {
      let level = -1;
      const tiers = TreeHelper.getTiers(t);
      for (const tier of tiers) {
        for (const tierRow of tier.rows) {
          level++;
          const row: AtmosTreeRow = {};
          row.left = tierRow[0] ?? undefined;
          row.center = tierRow[1] ?? undefined;
          row.right = tierRow[2] ?? undefined;
          rows[level] = row;
        }
      }
      return rows.slice().reverse();
    }

    return rows;
  });

  /**
   * Columns for node trees: left / center / right arrays indexed by level (0 = root).
   * CSS `flex-direction: column-reverse` places root at the bottom visually.
   */
  readonly columns = computed<AtmosTreeColumns>(() => {
    const cols: AtmosTreeColumns = { left: [], center: [], right: [] };
    const t = this.tree();
    if (!t.node) { return cols; }

    const build = (n: INode, dir: number, level: number) => {
      const arr = dir < 0 ? cols.left : dir > 0 ? cols.right : cols.center;
      arr[level] = n;
      if (n.nw) { build(n.nw, dir - 1, level); }
      if (n.ne) { build(n.ne, dir + 1, level); }
      if (n.n)  { build(n.n,  dir,     level + 1); }
    };
    build(t.node, 0, 0);

    // Pad all columns to the same length with undefined so slots align.
    const maxLen = Math.max(cols.left.length, cols.center.length, cols.right.length);
    for (let i = 0; i < maxLen; i++) {
      if (cols.left[i]   === undefined) { cols.left[i]   = undefined; }
      if (cols.center[i] === undefined) { cols.center[i] = undefined; }
      if (cols.right[i]  === undefined) { cols.right[i]  = undefined; }
    }

    return cols;
  });

  readonly action = computed<AtmosNodeAction>(() => this.forceNodeAction() ?? sharedNodeAction());

  /** Active node action, exposed for the control bar's active-state styling. */
  readonly currentAction = this.action;

  /** Whether the in-widget control bar should render. Hidden for forced-action trees. */
  readonly showControls = computed<boolean>(() => this.enableControls() && !this.forceNodeAction());

  readonly eventDate = computed<DateTime | undefined>(() => {
    const t = this.tree();
    return t.travelingSpirit?.date ?? t.specialVisitSpirit?.visit?.date;
  });

  /** True while any item in the tree is still locked (drives the unlock-all label). */
  readonly hasLocked = computed<boolean>(() => {
    this._refresh();
    return TreeHelper.getNodes(this.tree()).some(n => n.item && !n.item.unlocked);
  });

  private readonly opaqueMap = computed<Set<string>>(() => {
    const o = this.opaqueNodes();
    const set = new Set<string>();
    if (Array.isArray(o)) { o.forEach(g => set.add(g)); }
    return set;
  });

  readonly opaqueAll = computed<boolean>(() => this.opaqueNodes() === true);

  private readonly highlightItemSet = computed<Set<string>>(() => {
    const h = this.highlightItem();
    const set = new Set<string>();
    if (typeof h === 'string') { set.add(h); }
    else if (Array.isArray(h)) { h.forEach(g => set.add(g)); }
    return set;
  });

  private readonly highlightNodeSet = computed<Set<string>>(() => {
    const h = this.highlightNode();
    const set = new Set<string>();
    if (typeof h === 'string') { set.add(h); }
    else if (Array.isArray(h)) { h.forEach(g => set.add(g)); }
    return set;
  });

  readonly totalCost = computed<ICost>(() => {
    return CostHelper.add(CostHelper.create(), ...TreeHelper.getNodes(this.tree()));
  });

  readonly remainingCost = computed<ICost>(() => {
    this._refresh();
    const locked = TreeHelper.getNodes(this.tree()).filter(n => !n.unlocked && !n.item?.unlocked);
    return CostHelper.add(CostHelper.create(), ...locked);
  });

  isNodeOpaque(node: INode): boolean {
    return this.opaqueAll() || this.opaqueMap().has(node.guid);
  }

  isNodeHighlighted(node: INode): boolean {
    if (this.highlightNodeSet().has(node.guid)) { return true; }
    if (node.item && this.highlightItemSet().has(node.item.guid)) { return true; }
    return false;
  }

  onNodeClicked(event: MouseEvent, node: INode): void {
    // The node tile only emits plain left-clicks; modifier / middle clicks are
    // left to the browser so the item opens in a new tab via the anchor.

    // In emit mode the parent owns the behavior (calculators, friend trees, etc.).
    if (this.action() === 'emit') {
      this.nodeClicked.emit({ node, event });
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (!node.item) { return; }

    switch (this.action()) {
      case 'unlock': this.toggleNode(node); break;
      case 'navigate': this.findNode(node); break;
    }

    // Cancel the anchor's native navigation — we handled the click ourselves.
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private findNode(node: INode): void {
    void this._router.navigate(['/item', node.item!.guid]);
  }

  private toggleNode(node: INode): void {
    const tree = this.tree();
    const item = node.item!;
    const unlock = !item.unlocked;

    if (unlock && (item.group === 'SeasonPass' || item.group === 'Ultimate')) {
      const isFirstNode = node === item.nodes?.at(0);
      const season = item.season;
      if (isFirstNode && season && !this._storageService.hasSeasonPass(season.guid)) {
        const ok = confirm(
          `You've selected an item that requires the ${season.name} season pass. Do you want to unlock this item and the season pass?`
        );
        if (!ok) { return; }
        this._storageService.addSeasonPasses(season.guid);
      }
    }

    let toggleConnected = this._storageService.getKey('tree.unlock-connected') !== '0';
    if (!unlock && !node.unlocked) { toggleConnected = false; }

    const unlockCost = CostHelper.create();
    if (unlock) {
      const nodesToUnlock = toggleConnected ? NodeHelper.trace(node) : [node];
      for (const n of nodesToUnlock) {
        if (n.item && !n.item.unlocked) {
          this._nodeService.unlock(n);
          CostHelper.add(unlockCost, n);
        }
      }
    } else {
      const nodesToLock = toggleConnected ? NodeHelper.all(node) : [node];
      for (const n of nodesToLock) {
        if (n === node || n.unlocked) {
          this._nodeService.lock(n);
          CostHelper.add(unlockCost, n);
        }
      }
    }

    if (unlock) { CostHelper.invert(unlockCost); }
    this._currencyService.addTreeCost(unlockCost, tree);
  }

  setAction(action: AtmosNodeAction): void {
    sharedNodeAction.set(action);
  }

  toggleMenu(): void {
    this.showMenu.update(v => !v);
  }

  /** Unlock (or lock) every item in the tree at once. */
  unlockAll(): void {
    const tree = this.tree();
    // Debug helper: copy tree GUID instead of mutating.
    if (this._debugService.copyTree) {
      void navigator.clipboard.writeText(tree.guid || '');
      return;
    }

    const itemNodes = TreeHelper.getNodes(tree).filter(n => n.item);
    const items: Array<IItem> = itemNodes.map(n => n.item!);
    const shouldUnlock = items.filter(v => !v.unlocked).length;

    const msg = `Are you sure you want to ${shouldUnlock ? 'UNLOCK' : 'REMOVE'} all items from this tree?`;
    if (!confirm(msg)) { return; }

    const unlockCost = CostHelper.create();
    if (shouldUnlock) {
      itemNodes.filter(n => !n.item!.unlocked).forEach(node => {
        CostHelper.add(unlockCost, node);
        node.item!.unlocked = true;
        node.unlocked = true;
        this._storageService.addUnlocked(node.item!.guid);
        this._storageService.addUnlocked(node.guid);
        this._eventService.itemToggled.next(node.item!);
      });
    } else {
      itemNodes.filter(n => n.item!.unlocked).forEach(node => {
        if (node.unlocked) { CostHelper.add(unlockCost, node); }
        node.item!.unlocked = false;
        const refNodes = node.item!.nodes || [];
        refNodes.forEach(n => n.unlocked = false);
        this._storageService.removeUnlocked(node.item!.guid);
        this._storageService.removeUnlocked(...refNodes.map(n => n.guid));
        this._eventService.itemToggled.next(node.item!);
      });
    }

    if (shouldUnlock) { CostHelper.invert(unlockCost); }
    // TODO: this does not track the cost when locking nodes outside of this tree.
    this._currencyService.addTreeCost(unlockCost, tree);
  }

  editTree(): void {
    this.showMenu.set(false);
    const tree = this.tree();
    const result = confirm('Do you want to clone this tree as a new tree? [Yes] Clone [No] Modify');
    void this._router.navigate(['/spirit-tree/editor'], { queryParams: { tree: tree.guid, modify: !result } });
  }

  async exportPng(mode: ShareMode): Promise<void> {
    this.showMenu.set(false);
    const tree = this.tree();
    if (mode === 'share' && !navigator.share) { alert('Sharing is not supported by this browser.'); return; }
    if (mode === 'clipboard' && typeof ClipboardItem === 'undefined') {
      alert('Copying to clipboard is not supported by this browser.');
      return;
    }

    try {
      const title = tree.spirit?.name
        ?? tree.eventInstanceSpirit?.spirit?.name
        ?? tree.travelingSpirit?.spirit?.name
        ?? tree.specialVisitSpirit?.spirit?.name;
      let subtitle: string | undefined = this.visibleName();
      const date = this.eventDate();
      if (date) {
        subtitle = tree.travelingSpirit
          ? `TS #${tree.travelingSpirit.number}`
          : tree.specialVisitSpirit
            ? `${tree.specialVisitSpirit.visit.name}`
            : '';
        subtitle += ` (${date.toFormat('dd-MM-yyyy')})`;
      } else if (subtitle === title || subtitle === 'Spirit tree') {
        subtitle = undefined;
      }

      const canvas = await this._renderService.render(tree, { title, subtitle, background: true });
      if (mode === 'share') {
        this._renderService.shareCanvas(canvas, 'spirit-tree.png');
      } else {
        this._renderService.copyCanvas(canvas);
      }
    } catch (e: any) {
      alert(`Failed to copy the spirit tree: ${e?.message ?? e}`);
    }
  }
}
