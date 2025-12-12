import { Component, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { DebugService } from 'src/app/services/debug.service';
import { EventService } from 'src/app/services/event.service';
import { NodeService } from 'src/app/services/node.service';
import { StorageService } from 'src/app/services/storage.service';
import { HighlightType } from 'src/app/types/highlight';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '../items/item-icon/item-icon.component';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { CostHelper } from '@app/helpers/cost-helper';
import { CurrencyService } from '@app/services/currency.service';
import { INode } from 'skygame-data';

export type NodeAction = 'emit' | 'unlock' | 'navigate' | 'favourite';

@Component({
    selector: 'app-node',
    templateUrl: './node.component.html',
    styleUrls: ['./node.component.less'],
    imports: [NgbTooltip, RouterLink, ItemIconComponent, MatIcon]
})
export class NodeComponent implements OnChanges {
  @Input() node!: INode;
  @Input() position = 'center';
  @Input() highlight?: boolean;
  @Input() glowType?: HighlightType = 'default';
  @Input() action: NodeAction = 'unlock';
  @Input() enableNavigation = true;
  @Input() opaque?: boolean;
  @Input() showTooltips = true;

  @Output() readonly nodeClicked = new EventEmitter<MouseEvent>();

  @HostBinding('attr.guid')
  guid?: string;

  hover?: boolean;
  tooltipPlacement = 'bottom';
  link?: INavigationTarget;

  constructor(
    private readonly _debug: DebugService,
    private readonly _currencyService: CurrencyService,
    private readonly _eventService: EventService,
    private readonly _nodeService: NodeService,
    private readonly _storageService: StorageService,
    private readonly _router: Router
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['position']) {
      const pos = changes['position'].currentValue;
      this.tooltipPlacement = pos === 'left' ? 'bottom-start' : pos === 'right' ? 'bottom-end' : 'bottom';
    }

    if (changes['node']) {
      this.link = this.node?.item ? NavigationHelper.getItemLink(this.node.item) : undefined;
      this.guid = this.node?.guid;
    }
  }

  mouseEnter(event: MouseEvent): void {
    this.hover = true;
  }

  mouseLeave(event: MouseEvent): void {
    this.hover = false;
  }

  nodeClick(event: MouseEvent): void {
    if (event.ctrlKey || event.shiftKey) { return; }
    if (event.button === 1) { return; }

    switch (this.action) {
      case 'unlock': this.toggleNode(event); break;
      case 'navigate': this.findNode(event); break;
      case 'favourite': this.toggleFavourite(event); break;
      case 'emit': this.nodeClicked.emit(event); break;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  toggleFavourite(event: MouseEvent): void {
    if (!this.node.item) { return; }
    if (this.tryCopyDebug(event, this.node)) { return; }
    const item = this.node.item;

    // Toggle favourite status.
    item.favourited = !item.favourited;
    item.favourited ? this._storageService.addFavourites(item.guid) : this._storageService.removeFavourites(item.guid);
    this._eventService.itemFavourited.next(item);
  }

  toggleNode(event: MouseEvent): void {
    if (!this.node.item) { return; }
    if (this.tryCopyDebug(event, this.node)) { return; }
    const item = this.node.item;

    // Unlock (or lock) based on the item status.
    const unlock = !item.unlocked;

    // If this is the season item node and season pass is not owned, warn user.
    if (unlock && (item.group === 'SeasonPass' || item.group === 'Ultimate')) {
      const isFirstNode = this.node === item.nodes?.at(0);
      const season = item.season;
      const shouldWarn = isFirstNode && season && !this._storageService.hasSeasonPass(season.guid);
      if (shouldWarn) {
        if (!confirm(`You've selected an item that requires the ${item.season?.name} season pass. Do you want to unlock this item and the season pass?`)) {
          return;
        }
        this._storageService.addSeasonPasses(season.guid);
      }
    }

    let toggleConnected = this._storageService.getKey('tree.unlock-connected') !== '0';
    // Don't lock connected nodes if this isn't the unlocked node for the item.
    if (!unlock && !this.node.unlocked) { toggleConnected = false; }

    // Save progress.
    const unlockCost = CostHelper.create();
    if (unlock) {
      const nodesToUnlock = toggleConnected ? NodeHelper.trace(this.node) : [this.node];

      for (const node of nodesToUnlock) {
        if (node.item && !node.item.unlocked) {
          this._nodeService.unlock(node);
          CostHelper.add(unlockCost, node);
        }
      }
    } else {
      const nodesToLock = toggleConnected ? NodeHelper.all(this.node) : [this.node];

      for (const node of nodesToLock) {
        if (node === this.node || node.unlocked) {
          this._nodeService.lock(node);
          CostHelper.add(unlockCost, node);
        }
      }
    }

    // When unlocking, invert cost.
    if (unlock) { CostHelper.invert(unlockCost); }

    // Modify currencies.
    // TODO: this does not track the cost when locking nodes outside of this tree.
    const tree = this.node.root?.tree;
    tree && this._currencyService.addTreeCost(unlockCost, tree);
  }

  findNode(event: MouseEvent): void {
    if (!this.node.item) { return; }
    const item = this.node.item;

    // Find spirit from last appearance of item.
    const target = NavigationHelper.getItemLink(item);
    if (!target) {
      alert('This item does not have a page.');
      return;
    }

    void this._router.navigate(target.route, target.extras);
  }

  tryCopyDebug(event: Event, node: INode): boolean {
    if (!this._debug.copyNode) { return false; }
    navigator.clipboard.writeText(node.guid);
    return true;
  }
}
