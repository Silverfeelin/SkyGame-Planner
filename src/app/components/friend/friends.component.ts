import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { IItem, INode, ISpiritTree, ITierNode } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { NodeHelper } from '@app/helpers/node-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { WikiLinkComponent } from '@app/components/util/wiki-link/wiki-link.component';
import { FriendTiersComponent } from './friend-tiers/friend-tiers.component';

interface IFriendshipData {
  friends: Array<{
    guid?: string, date: string, name: string,
    /** Item IDs unlocked in the old friendship tree. Removed once migrated to `tierUnlocked`. */
    unlocked?: string,
    tierUnlocked?: Array<string>
  }>;
}

interface IFriend {
  guid: string;
  date?: DateTime;
  name: string;
  nodes: ReadonlyArray<ITierNode>;
  visible: boolean;
  expanded: boolean;
  loaded: boolean;
}

interface ISourceNode {
  guid: string;
  item: IItem;
  tier: number;
  c?: number;
  ac?: number;
}

/** Friendship tree from before the tiers. Old saves list the unlocked item IDs from it. */
const LEGACY_TREE = 'Ne9qn6B0kB';

/** Friendship tiers holding every entry at its level 1 slot. */
const FRIENDSHIP_TREE = 'JczAIPXH-s';

/** Level 2 nodes, kept out of the tiers in skygame-data. They're always in the same tier as level 1. */
const LEVEL_2_NODES: ReadonlyArray<string> = [
  'My2sae01Aj', 'g58JjJ487u', 'ExvEtR0k3h', 'K-wRvUnO9P', '_5lt2rDrBW', 'pcMZQyhVJ_', 'uX1NKANOUc', 'Ce7VloeSem',
  'egISm727KN', 'p4YJFfzqZ8', '2R-wgen-eZ', 'QGO0dpClA9', 'V0pjfN5zah', 'K18DcipCpW', 'h-80eFOBZW'
];

/** Levels 3-4 aren't nodes in skygame-data, since their range can start in a later tier than level 1. */
const UPGRADE_NODES: ReadonlyArray<Omit<ISourceNode, 'item'> & { item: string }> = [
  { guid: 'JeQvkLixp-', item: 'DBTFDxCGm3', tier: 2, c: 2 },  // Fist Bump 3
  { guid: '_kDPTPSKFl', item: 'DtX93JYWYD', tier: 2, c: 2 },  // Fist Bump 4
  { guid: 'tmwK6volid', item: 'SS1cciKOn4', tier: 2, c: 4 },  // Handshake 3
  { guid: 'PK6Fl4dEw5', item: 'g2x-AifX6q', tier: 2, c: 4 },  // Handshake 4
  { guid: '4VFaOROABT', item: 'OYNM_Kqsw8', tier: 2, c: 3 },  // High Five 3
  { guid: 'Y3ibjk-5mF', item: 'abvqYkR7md', tier: 2, c: 3 },  // High Five 4

  { guid: '9n6vR-p3wl', item: '6STtmsf-yq', tier: 3, c: 4 },  // Side Hug 3
  { guid: 'yLMh-a3h2-', item: 'R0sApxsFvq', tier: 3, c: 4 },  // Side Hug 4
  { guid: 'lSQO1H1VLE', item: '4mdTrHGmav', tier: 3, c: 5 },  // Duet Bow 3
  { guid: '-eC7Oiv63l', item: 'wLB1KtEqnj', tier: 3, c: 5 },  // Duet Bow 4

  { guid: 'zzRNufqKJV', item: 'JO8Ga3S4ya', tier: 4, c: 7 },  // Duet Dance 3
  { guid: 'DfezilaDiv', item: 'ti6FPoODaA', tier: 4, c: 7 },  // Duet Dance 4
  { guid: 'O7pPruFIVR', item: 'cie5WT1eqE', tier: 4, c: 9 },  // Hair Tousle 3
  { guid: '7yRYAk2woH', item: 'Q7dtCNyphy', tier: 4, c: 9 },  // Hair Tousle 4

  { guid: 'OaKjrlNSSB', item: 'g8JfnFziVU', tier: 5, c: 12 }, // Revolving Dance 3
  { guid: 'mnssh4WjQw', item: 'MC8oDSqv_N', tier: 5, c: 12 }, // Revolving Dance 4
  { guid: 'NLOsqehc75', item: 'nDNV_xU8rT', tier: 5, c: 15 }, // Whispering 3
  { guid: '1v5xnT962-', item: 'u1jRntY84E', tier: 5, c: 15 }, // Whispering 4

  { guid: 'JTnWwYxVpO', item: 'bvQ3zaKjDk', tier: 6, c: 22 }, // Play Fight 3
  { guid: '9jBZ9wtNO9', item: '32abBn-oC6', tier: 6, c: 22 }, // Play Fight 4
  { guid: 'gT1SkNjnjC', item: 'WmaeEG2msh', tier: 6, c: 24 }, // Bearhug 3
  { guid: 'b_izl7IqxT', item: 'bm5wgRqwty', tier: 6, c: 24 }, // Bearhug 4
  { guid: 'L51PAEX23w', item: '_FgImFpohg', tier: 6, c: 25 }, // Secret Handshake 3
  { guid: 'aaaXaGFUYG', item: 'Zoo33SoYU4', tier: 6, c: 25 }, // Secret Handshake 4
  { guid: 'AwYRULW7h5', item: 'MX3V1sd17B', tier: 6, c: 26 }, // Hug 3
  { guid: 'ELRyqkYywm', item: 'MCTPUnPl7k', tier: 6, c: 26 }, // Hug 4
];

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, WikiLinkComponent, FriendTiersComponent]
})
export class FriendsComponent {
  private readonly _dataService = inject(DataService);
  private readonly _storageService = inject(StorageService);

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly friends = signal<ReadonlyArray<IFriend>>([]);

  private _searchTimeout?: number;

  constructor() {
    let data = this._storageService.getKey('friends') as IFriendshipData;
    if (!data?.friends?.length) {
      data = { friends: [ { date: DateTime.now().toISO()!, name: 'Example', tierUnlocked: [] } ] };
    }

    this.friends.set(data.friends.map(f => this.createFriend(
      f.guid ?? nanoid(10), f.name, DateTime.fromISO(f.date), f.tierUnlocked ?? this.migrateLegacy(f.unlocked ?? '')
    )));

    if (data.friends.some(f => !f.tierUnlocked)) { this.save(); }
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

  promptAdd(): void {
    const name = prompt('Enter friend name:');
    if (!name) { return; }
    this.friends.set([
      ...this.friends(),
      this.createFriend(nanoid(10), name, DateTime.now(), [])
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

  private createFriend(guid: string, name: string, date: DateTime, tierUnlocked: ReadonlyArray<string>): IFriend {
    return {
      guid, name, date,
      nodes: this.createNodes(new Set(tierUnlocked)),
      visible: true,
      expanded: false,
      loaded: false
    };
  }

  private createNodes(unlocked: ReadonlySet<string>): Array<ITierNode> {
    return this.getSourceNodes().map(source => {
      const isUnlocked = unlocked.has(source.guid);
      // Friends share the item catalogue, so each friend gets detached copies to track separately.
      const item: IItem = {
        id: source.item.id,
        guid: nanoid(10),
        type: source.item.type,
        name: source.item.name,
        icon: source.item.icon,
        level: source.item.level,
        unlocked: isUnlocked
      };
      return { guid: source.guid, item, tier: source.tier, c: source.c, ac: source.ac, unlocked: isUnlocked };
    });
  }

  /** Unlocks every level up to the highest level unlocked in the old tree, per entry. */
  private migrateLegacy(unlocked: string): Array<string> {
    const ids = new Set(unlocked.match(/.{1,3}/g)?.map(s => parseInt(s, 36)) ?? []);
    const tree = this._dataService.guidMap.get(LEGACY_TREE) as ISpiritTree | undefined;
    if (!ids.size || !tree?.node) { return []; }

    const levels = new Map<string, number>();
    for (const node of NodeHelper.all(tree.node)) {
      if (!node.item || !ids.has(node.item.id!)) { continue; }
      levels.set(node.item.name, Math.max(levels.get(node.item.name) ?? 0, node.item.level ?? 1));
    }

    return this.getSourceNodes()
      .filter(n => (n.item.level ?? 1) <= (levels.get(n.item.name) ?? 0))
      .map(n => n.guid);
  }

  /** Every level node, starting with the level 1 nodes in tier and slot order. */
  private getSourceNodes(): Array<ISourceNode> {
    const guidMap = this._dataService.guidMap;
    // Nodes outside the tiers aren't resolved, so their item is still a GUID.
    const resolveItem = (item: IItem | string) => typeof item === 'string' ? guidMap.get(item) as IItem : item;
    const toSource = (node: INode, tier: number): ISourceNode => ({ guid: node.guid, item: resolveItem(node.item!), tier, c: node.c, ac: node.ac });

    const tree = guidMap.get(FRIENDSHIP_TREE) as ISpiritTree;
    const placed = TreeHelper.getTiers(tree).flatMap((tier, i) => tier.rows.flat().filter(n => !!n).map(n => toSource(n!, i + 1)));
    const placedTier = new Map(placed.map(n => [n.item.name, n.tier]));
    return [
      ...placed,
      ...LEVEL_2_NODES.map(guid => {
        const node = guidMap.get(guid) as INode;
        return toSource(node, placedTier.get(resolveItem(node.item!).name)!);
      }),
      ...UPGRADE_NODES.map(u => ({ ...u, item: guidMap.get(u.item) as IItem }))
    ];
  }

  save(): void {
    const data: IFriendshipData = {
      friends: this.friends().map(f => ({
        guid: f.guid,
        date: f.date?.toISO() ?? DateTime.now().toISO()!,
        name: f.name,
        tierUnlocked: f.nodes.filter(n => n.unlocked).map(n => n.guid)
      }))
    };
    this._storageService.setKey('friends', data);
  }
}
