import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { ISpiritTree } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { EventService } from '@app/services/event.service';
import { StorageService } from '@app/services/storage.service';
import { NodeHelper } from '@app/helpers/node-helper';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import {
  AtmosSpiritTreeComponent,
  AtmosSpiritTreeNodeClickEvent
} from '../spirit/spirit-tree/atmos-spirit-tree.component';

interface IFriendshipData {
  friends: Array<{ guid?: string, date: string, name: string, unlocked: string }>;
}

interface IFriend {
  guid: string;
  date?: DateTime;
  name: string;
  tree: ISpiritTree;
  visible: boolean;
  expanded: boolean;
  loaded: boolean;
}

@Component({
  selector: 'app-atmos-friends',
  templateUrl: './atmos-friends.component.html',
  styleUrl: './atmos-friends.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, WikiLinkComponent, AtmosSpiritTreeComponent]
})
export class AtmosFriendsComponent {
  private readonly _dataService = inject(DataService);
  private readonly _eventService = inject(EventService);
  private readonly _storageService = inject(StorageService);

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly friends = signal<ReadonlyArray<IFriend>>([]);

  private readonly _treeTemplate = this._dataService.guidMap.get('Ne9qn6B0kB') as ISpiritTree;
  private _searchTimeout?: number;

  constructor() {
    let data = this._storageService.getKey('friends') as IFriendshipData;
    if (!data?.friends?.length) {
      data = { friends: [ { date: DateTime.now().toISO()!, name: 'Example', unlocked: (2753).toString(36).padStart(3, '0') } ] };
    }

    this.friends.set(data.friends.map(f => ({
      guid: f.guid ?? nanoid(10),
      date: DateTime.fromISO(f.date),
      name: f.name,
      tree: this.cloneFriendTree(f.unlocked),
      visible: true,
      expanded: false,
      loaded: false
    })));
  }

  search(): void {
    window.clearTimeout(this._searchTimeout);
    this._searchTimeout = window.setTimeout(() => {
      const search = this.searchInput()?.nativeElement?.value.toLowerCase().trim() ?? '';
      this.friends.set(this.friends().map(f => ({
        ...f,
        visible: !search || f.name.toLowerCase().includes(search)
      })));
      this._searchTimeout = undefined;
    }, 300);
  }

  toggleExpand(friend: IFriend): void {
    const expanded = !friend.expanded;
    const loaded = friend.loaded || expanded;
    this.friends.set(this.friends().map(f => f === friend ? { ...f, expanded, loaded } : f));
  }

  nodeClicked(friend: IFriend, evt: AtmosSpiritTreeNodeClickEvent): void {
    evt.node.unlocked = !evt.node.unlocked;
    if (evt.node.item) { evt.node.item.unlocked = evt.node.unlocked; }
    this._eventService.itemToggled.next(evt.node.item!);
    // Trigger change detection by re-emitting the friends list (same identity object on row).
    this.friends.set([...this.friends()]);
    this.save();
  }

  promptAdd(): void {
    const name = prompt('Enter friend name:');
    if (!name) { return; }
    this.friends.set([
      ...this.friends(),
      {
        guid: nanoid(10),
        date: DateTime.now(),
        name,
        tree: this.cloneFriendTree(''),
        visible: true,
        expanded: false,
        loaded: false
      }
    ]);
    this.save();
  }

  promptRename(friend: IFriend): void {
    const name = prompt('Enter new name:', friend.name);
    if (name == null) { return; }
    this.friends.set(this.friends().map(f => f === friend ? { ...f, name } : f));
    this.save();
  }

  promptDelete(friend: IFriend): void {
    if (!confirm(`Are you sure you want to delete ${friend.name}?`)) { return; }
    this.friends.set(this.friends().filter(f => f !== friend));
    this.save();
  }

  private cloneFriendTree(unlocked: string): ISpiritTree {
    const unlockedIds = new Set(unlocked.match(/.{1,3}/g)?.map(s => parseInt(s, 36)) ?? []);
    const node = NodeHelper.clone(this._treeTemplate.node!);
    const nodes = NodeHelper.all(node);
    nodes.forEach(n => {
      if (!n.item) { return; }
      const u = unlockedIds.has(n.item.id!);
      n.unlocked = u;
      n.item = {
        id: n.item.id,
        guid: nanoid(10),
        type: n.item.type,
        name: n.item.name,
        icon: n.item.icon,
        level: n.item.level,
        unlocked: u
      };
    });
    return { guid: nanoid(10), node };
  }

  private save(): void {
    const data: IFriendshipData = {
      friends: this.friends().map(f => ({
        guid: f.guid,
        date: f.date?.toISO() ?? DateTime.now().toISO()!,
        name: f.name,
        unlocked: NodeHelper.all(f.tree.node)
          .filter(n => n.unlocked)
          .map(n => n.item!.id!.toString(36).padStart(3, '0'))
          .join('')
      }))
    };
    this._storageService.setKey('friends', data);
  }
}
