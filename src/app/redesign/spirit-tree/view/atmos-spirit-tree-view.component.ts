import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { EventService } from '@app/services/event.service';
import { CurrencyService } from '@app/services/currency.service';
import { NodeService } from '@app/services/node.service';
import { SpiritTreeRenderService } from '@app/services/spirit-tree-render.service';
import { CostHelper } from '@app/helpers/cost-helper';
import { NodeHelper } from '@app/helpers/node-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import {
  AtmosSpiritTreeComponent,
  AtmosSpiritTreeNodeClickEvent
} from '@app/redesign/shared/atmos-shared-widgets';
import { AtmosNodeAction } from '@app/redesign/spirit/node/atmos-node.component';

type ShareMode = 'share' | 'clipboard';

/**
 * Atmospheric spirit-tree page. Owns the page-level controls that the shared
 * `AtmosSpiritTreeComponent` widget deliberately does not implement: keyboard
 * shortcuts (`f` / `n` / `u`), "unlock all", "edit tree", PNG export, and the
 * unlock/lock node click pipeline against `NodeService` + `CurrencyService`.
 */
@Component({
  selector: 'app-atmos-spirit-tree-view',
  templateUrl: './atmos-spirit-tree-view.component.html',
  styleUrl: './atmos-spirit-tree-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, AtmosSpiritTreeComponent]
})
export class AtmosSpiritTreeViewComponent {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);
  private readonly _eventService = inject(EventService);
  private readonly _currencyService = inject(CurrencyService);
  private readonly _nodeService = inject(NodeService);
  private readonly _renderService = inject(SpiritTreeRenderService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);

  readonly tree = signal<ISpiritTree | undefined>(undefined);
  readonly nodeAction = signal<AtmosNodeAction>('unlock');

  readonly title = computed<string | undefined>(() => {
    const t = this.tree();
    if (!t) { return undefined; }
    return t.spirit?.name
      ?? t.eventInstanceSpirit?.spirit?.name
      ?? t.travelingSpirit?.spirit?.name
      ?? t.specialVisitSpirit?.spirit?.name
      ?? t.name;
  });

  constructor() {
    this._route.paramMap.subscribe(params => {
      const t = this._dataService.guidMap.get(params.get('guid')!) as ISpiritTree | undefined;
      this.tree.set(t);
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    if (evt.shiftKey || evt.ctrlKey || evt.altKey || evt.metaKey) { return; }
    const target = evt.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) { return; }

    let action: AtmosNodeAction | undefined;
    switch (evt.key?.toLocaleLowerCase()) {
      case 'f': action = 'favourite'; break;
      case 'n': action = 'navigate'; break;
      case 'u': action = 'unlock'; break;
      default: return;
    }

    if (this.nodeAction() === action) { action = 'unlock'; }
    this.nodeAction.set(action);
    evt.preventDefault();
  }

  setAction(action: AtmosNodeAction): void {
    this.nodeAction.set(action);
  }

  onNodeClicked(evt: AtmosSpiritTreeNodeClickEvent): void {
    const tree = this.tree();
    if (!tree) { return; }
    const node = evt.node;
    if (!node.item) { return; }
    if (evt.event.ctrlKey || evt.event.shiftKey || evt.event.button === 1) { return; }

    switch (this.nodeAction()) {
      case 'favourite': this.toggleFavourite(evt); break;
      case 'navigate': this.findNode(evt); break;
      case 'unlock': this.toggleNode(tree, evt); break;
      case 'emit': break;
    }

    evt.event.preventDefault();
    evt.event.stopImmediatePropagation();
  }

  private toggleFavourite(evt: AtmosSpiritTreeNodeClickEvent): void {
    const item = evt.node.item!;
    item.favourited = !item.favourited;
    item.favourited
      ? this._storageService.addFavourites(item.guid)
      : this._storageService.removeFavourites(item.guid);
    this._eventService.itemFavourited.next(item);
  }

  private findNode(evt: AtmosSpiritTreeNodeClickEvent): void {
    const item = evt.node.item!;
    // Defer to the item route — keeps the legacy navigation behavior.
    void this._router.navigate(['/item', item.guid]);
  }

  private toggleNode(tree: ISpiritTree, evt: AtmosSpiritTreeNodeClickEvent): void {
    const node = evt.node;
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

  unlockAll(): void {
    const tree = this.tree();
    if (!tree) { return; }
    const nodes = TreeHelper.getNodes(tree);
    const itemNodes = nodes.filter(n => n.item);
    const items = itemNodes.map(n => n.item!);
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
    this._currencyService.addTreeCost(unlockCost, tree);
  }

  editTree(): void {
    const tree = this.tree();
    if (!tree) { return; }
    const result = confirm('Do you want to clone this tree as a new tree? [Yes] Clone [No] Modify');
    void this._router.navigate(['/spirit-tree/editor'], { queryParams: { tree: tree.guid, modify: !result } });
  }

  async exportPng(mode: ShareMode): Promise<void> {
    const tree = this.tree();
    if (!tree) { return; }
    if (mode === 'share' && !navigator.share) { alert('Sharing is not supported by this browser.'); return; }
    if (mode === 'clipboard' && typeof ClipboardItem === 'undefined') {
      alert('Copying to clipboard is not supported by this browser.');
      return;
    }

    try {
      const title = this.title();
      let subtitle: string | undefined = tree.name ?? undefined;
      const tsDate = tree.travelingSpirit?.date;
      const rsDate = tree.specialVisitSpirit?.visit?.date;
      if (tsDate || rsDate) {
        subtitle = tsDate
          ? `TS #${tree.travelingSpirit!.number}`
          : `${tree.specialVisitSpirit!.visit.name}`;
        subtitle += ` (${(tsDate || rsDate)!.toFormat('dd-MM-yyyy')})`;
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
