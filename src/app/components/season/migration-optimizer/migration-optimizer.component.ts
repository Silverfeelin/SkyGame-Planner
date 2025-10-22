import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SpiritTreeComponent, SpiritTreeNodeClickEvent } from '@app/components/spirit-tree/spirit-tree.component';
import { DateHelper } from '@app/helpers/date-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { INode } from '@app/interfaces/node.interface';
import { ISeason } from '@app/interfaces/season.interface';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { DataService } from 'src/app/services/data.service';
import { MatIcon } from "@angular/material/icon";
import { StorageService } from '@app/services/storage.service';
import { ItemType } from '@app/interfaces/item.interface';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';

@Component({
    selector: 'app-migration-optimizer',
    templateUrl: './migration-optimizer.component.html',
    styleUrls: ['./migration-optimizer.component.less'],
    imports: [SpiritTreeComponent, OverlayComponent, ReactiveFormsModule, MatIcon]
})
export class MigrationOptimizerComponent {
  dataService = inject(DataService);
  storageService = inject(StorageService);

  trees = [
    "ko9lr8M4J5", "zK7AFf0rvZ", "nCGzsegB0l", "iFANrbgSY4", "nrvSEyff0h"
  ].map(id => this.dataService.guidMap.get(id) as ISpiritTree);
  season = this.dataService.guidMap.get('wslfxJ5HZJ') as ISeason;

  want = signal<{ [guid: string]: INode }>({});
  wantNodeGuids = computed(() => Object.values(this.want()).map(n => n.guid));

  tierUnlockCost = [ 0, 40, 60, 80, 100 ];
  tierUnlockCostCumulative = [ 0, 40, 100, 180, 280 ];
  today = DateHelper.todaySky();
  daysLeft =  DateHelper.daysBetween(this.today, this.season.endDate!);
  daysFriendshipLeft = this.daysLeft * 10;

  nodeValues: { [ guid: string]: number } = {};
  nodeEfficiency: { [ guid: string]: number } = {};

  friendshipControls = this.trees.map(_ => new FormControl(0));
  friendshipValues = this.friendshipControls.map((c) => {
    return toSignal(c.valueChanges, { initialValue: c.value });
  });

  missingFriendship = [ [0], [0], [0], [0], [0] ];
  missingFriendshipTotals = [ 0, 0, 0, 0, 0];
  missingFriendshipTotal = 0;
  showingFriendshipHelp = false;

  constructor() {
    const savedWantNodes = JSON.parse(this.storageService.getKey('migration.optimizer') || '[]') as string[];
    if (savedWantNodes.length > 0) {
      const mapped = Object.fromEntries(
        savedWantNodes.map(guid => [guid, this.dataService.guidMap.get(guid) as INode])
      );
      this.want.set(mapped);
    }

    this.nodeValues = {};
    this.trees.forEach((tree, iTree) => {
      const tiers = TreeHelper.getTiers(tree);
      let currentFriendship = 0;
      tiers.forEach((tier, iTier) => {
        if (iTier === tiers.length - 1) { return; } // No need to check last tier.
        const tierFriendshipNodes = tier.rows.flat().filter((node, iNode) => iNode < 2 && node) as INode[];
        const friendshipPerNode = this.tierUnlockCost[iTier + 1] / tierFriendshipNodes.length;
        tierFriendshipNodes.forEach(node => {
          this.nodeValues[node.guid] = friendshipPerNode;
          this.nodeEfficiency[node.guid] = +(node.sc ? friendshipPerNode / node.sc : 99).toFixed(2);
          if (node.unlocked) {
            if (currentFriendship < this.tierUnlockCostCumulative[iTier]) {
              currentFriendship = this.tierUnlockCostCumulative[iTier];
            }
            currentFriendship += friendshipPerNode;
          }
        });
      });

      if (currentFriendship > 0) {
        this.friendshipControls[iTree].setValue(currentFriendship, { emitEvent: true });
      }
    });

    this.friendshipControls.forEach(control => {
      control.valueChanges.subscribe(() => this.calculate());
    });
    this.calculate();
  }

  onNodeClicked(evt: SpiritTreeNodeClickEvent): void {
    this.want.update(v => {
      v[evt.node.guid] ? delete v[evt.node.guid] : v[evt.node.guid] = evt.node;
      return { ...v };
    });
    this.storageService.setKey('migration.optimizer', JSON.stringify(Object.keys(this.want())));
    this.calculate();
  }

  highlightCosmetics(): void {
    const itemTypeSet = new Set<ItemType>([
      ItemType.Outfit, ItemType.Shoes, ItemType.Mask,
      ItemType.FaceAccessory, ItemType.Necklace, ItemType.Hair,
      ItemType.HairAccessory, ItemType.HeadAccessory, ItemType.Cape,
      ItemType.Held, ItemType.Furniture, ItemType.Prop
    ]);
    let changed = false;
    const want = { ...this.want() };
    this.trees.forEach(tree => {
      const nodes = TreeHelper.getNodes(tree);
      nodes.forEach(node => {
        if (!node?.item) { return; }
        if (!itemTypeSet.has(node.item.type)) { return; }
        want[node.guid] = node;
        changed = true;
      });
    });
    if (changed) {
      this.want.set(want);
      this.calculate();
    }
  }

  highlightSeasonHearts(): void {
    let changed = false;
    const want = { ...this.want() };
    this.trees.forEach(tree => {
      const nodes = TreeHelper.getNodes(tree);
      nodes.forEach(node => {
        if (!node?.item) { return; }
        if (node.item.name !== 'Season Heart') { return; }
        want[node.guid] = node;
        changed = true;
      });
    });
    if (changed) {
      this.want.set(want);
      this.calculate();
    }
  }

  promptResetHighlight(): void {
    if (!confirm('Are you sure you want to reset all highlighted items?')) { return; }
    this.want.set({});
    this.storageService.setKey('migration.optimizer', JSON.stringify([]));
    this.calculate();
  }

  calculate(): void {
    const wantNodeGuids = this.wantNodeGuids();
    this.missingFriendshipTotals = [ 0, 0, 0, 0, 0 ];
    this.missingFriendship = [ [], [], [], [], [] ];

    this.trees.forEach((tree, iTree) => {
      const tiers = TreeHelper.getTiers(tree);

      // Check how many total points are needed.
      let requiredFriendship = 0;
      tiers.forEach((tier, iTier) => {
        if (tier.rows.some(row => row.some(node => node && wantNodeGuids.includes(node.guid) && !node.unlocked))) {
          requiredFriendship = this.tierUnlockCostCumulative[iTier];
        }
      });

      // Check how many points are guaranteed through desired nodes.
      let currentFriendship = this.friendshipValues[iTree]() ?? 0;
      tiers.forEach((tier, iTier) => {
        if (iTier === tiers.length - 1) { return; } // No need to check last tier.

        const tierFriendshipNodes = tier.rows.flat().filter((node, iNode) => iNode < 2 && node) as INode[];
        const tierAvailableNodes = tierFriendshipNodes.filter(node => !node.unlocked);
        const friendshipPerNode = this.tierUnlockCost[iTier + 1] / tierAvailableNodes.length;
        const friendshipNeeded = this.tierUnlockCostCumulative[iTier + 1];

        // Add guaranteed nodes.
        tierAvailableNodes.forEach(node => {
          if (wantNodeGuids.includes(node.guid)) {
            currentFriendship += friendshipPerNode;
          }
        });

        if (currentFriendship >= requiredFriendship) {
          this.missingFriendship[iTree].push(0);
        } else {
          this.missingFriendship[iTree].push(Math.max(0, friendshipNeeded - currentFriendship));
          if (friendshipNeeded > currentFriendship) {
            currentFriendship = friendshipNeeded;
          }
        }

        // const missingPoints = requiredFriendship - currentFriendship;
      });

      this.missingFriendshipTotals[iTree] = this.missingFriendship[iTree].reduce((a, b) => a + b, 0);
    });
    this.missingFriendshipTotal = this.missingFriendshipTotals.reduce((a, b) => a + b, 0);
  }
}
