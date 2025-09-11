import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { ISpiritTree } from '@app/interfaces/spirit-tree.interface';
import { NodeHelper } from '@app/helpers/node-helper';
import { SpiritTreeComponent, SpiritTreeNodeClickEvent } from "../spirit-tree/spirit-tree.component";
import { WikiLinkComponent } from "../util/wiki-link/wiki-link.component";

interface IFriendshipData {
  friends: Array<{ date: string, name: string, unlocked: string }>;
}

interface IFriend {
  date?: DateTime;
  name: string;
  tree: ISpiritTree;
  visible: boolean;
}

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, WikiLinkComponent, SpiritTreeComponent, CommonModule]
})
export class FriendsComponent {
  searchInput = viewChild<ElementRef<HTMLInputElement>>('input');

  dataService = inject(DataService);
  eventService = inject(EventService);
  storageService = inject(StorageService);
  changeDetectorRef = inject(ChangeDetectorRef);

  treeTemplate = this.dataService.guidMap.get('Ne9qn6B0kB') as ISpiritTree;
  friends: Array<IFriend> = [];

  private searchTimeout?: number;

  constructor() {
    const data = this.storageService.getKey('friends') as IFriendshipData ?? {
      friends: [ { date: DateTime.now().toISO(), name: 'Example', unlocked: (2753).toString(36).padStart(3, '0') } ]
    };

    this.friends = data.friends.map(f => ({
      date: DateTime.fromISO(f.date),
      name: f.name,
      tree: this.cloneFriendTree(f.unlocked),
      visible: true
    }));
  }

  search(): void {
    window.clearTimeout(this.searchTimeout);
    this.searchTimeout = window.setTimeout(() => {
      const search = this.searchInput()?.nativeElement?.value.toLowerCase().trim();
      this.friends.forEach(f => f.visible = !search || f.name.toLowerCase().includes(search));
      this.changeDetectorRef.markForCheck();
      this.searchTimeout = undefined;
    }, 300);
  }

  cloneFriendTree(unlocked: string): ISpiritTree {
    const unlockedIds = new Set(unlocked.match(/.{1,3}/g)?.map(s => parseInt(s, 36)) ?? []);
    const node = NodeHelper.clone(this.treeTemplate.node);
    const nodes = NodeHelper.all(node);
    nodes.forEach(n => {
      if (!n.item) { return; }
      const unlocked = unlockedIds.has(n.item.id!);
      n.unlocked = unlocked;
      n.item = {
        id: n.item.id,
        guid: nanoid(10),
        type: n.item.type,
        name: n.item.name,
        icon: n.item.icon,
        level: n.item.level,
        unlocked
      }
    });
    return {
      guid: nanoid(10),
      node
    };
  }

  nodeClicked(evt: SpiritTreeNodeClickEvent) {
    evt.node.unlocked = !evt.node.unlocked;
    evt.node.item && (evt.node.item.unlocked = evt.node.unlocked);
    this.eventService.itemToggled.next(evt.node.item!);
    this.changeDetectorRef.markForCheck();
    this.save();
  }

  private save(): void {
    const data: IFriendshipData = {
      friends: this.friends.map(f => ({
      date: f.date?.toISO() ?? DateTime.now().toISO(),
      name: f.name,
      unlocked: NodeHelper.all(f.tree.node)
        .filter(n => n.unlocked)
        .map(n => n.item!.id!.toString(36).padStart(3, '0'))
        .join('')
      }))
    };
    this.storageService.setKey('friends', data);
  }
}
