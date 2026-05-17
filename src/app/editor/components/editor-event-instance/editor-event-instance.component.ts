import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { JsonHelper } from 'src/app/helpers/json-helper';
import { NodeHelper } from 'src/app/helpers/node-helper';
import { DataService } from 'src/app/services/data.service';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DataJsonService } from '@app/services/data-json.service';
import { IEvent, IEventInstance, ISpirit, IEventInstanceSpirit, ISpiritTree, IShop, IIAP, INode } from 'skygame-data';

@Component({
    selector: 'app-editor-event-instance',
    templateUrl: './editor-event-instance.component.html',
    styleUrls: ['./editor-event-instance.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, NgFor, NgIf]
})
export class EditorEventInstanceComponent {
  isDraft = new FormControl(true);

  events: Array<IEvent>;
  eventGuid = new FormControl('');
  date = new FormControl(new Date().toISOString().split('T')[0]);
  endDate = new FormControl(new Date().toISOString().split('T')[0]);
  calendarLink = new FormControl('');
  event?: IEvent;
  lastInstance?: IEventInstance;

  instance?: Partial<IEventInstance>;
  // shops?: Array<IShop>;
  // spirits?: Array<IEventInstanceSpirit>;
  // trees?: Array<ISpiritTree>;
  // nodes?: Array<INode>;

  constructor(
    private readonly _dataService: DataService,
    private readonly _dataJsonService: DataJsonService
  ) {
    this.events = this._dataService.eventConfig.items.filter(e => e.instances?.length);
    this.eventGuid.valueChanges.subscribe(() => this.eventChanged());
  }

  eventChanged(): void {
    this.clear();

    this.event = this.eventGuid.value
      ? this._dataService.guidMap.get(this.eventGuid.value) as IEvent
      : undefined;

    if (!this.event) { return; }
    this.lastInstance = this.event.instances!.at(-1)!;
    if (this.lastInstance.date > DateTime.now().minus({ days: 14 })) {
      this.lastInstance = this.event.instances!.at(-2)!;
    }

    this.generate();
  }

  private clear(): void {
    this.lastInstance = undefined;
    this.instance = undefined;
  }

  generate(): void {
    const placeholderSpirit = this._dataService.guidMap.get('U9vUspUuRp') as ISpirit;

    // Parse dates.
    const date = DateTime.fromFormat(this.date.value!, 'yyyy-MM-dd');
    const endDate = DateTime.fromFormat(this.endDate.value!, 'yyyy-MM-dd');

    // Copy spirit trees.
    const spirits: Array<IEventInstanceSpirit> = [];
    const treeSpirit = this.lastInstance?.spirits?.at(0)?.spirit
      ?? placeholderSpirit;

    const tree: ISpiritTree = {
      guid: nanoid(10),
      node: this._dataService.guidMap.get('qzYl3ywsFd') as INode
    };

    const newSpirit: IEventInstanceSpirit = {
      guid: nanoid(10),
      spirit: treeSpirit,
      tree
    };

    spirits.push(newSpirit);

    // Copy shops.
    const shops: Array<IShop> = [];
    const iaps: Array<IIAP> = [];
    this.lastInstance?.shops?.forEach(shop => {
      shop.iaps?.forEach(iap => {
        const clonedIap: IIAP = {
          guid: nanoid(10),
          name: iap.name,
          price: iap.price,
          returning: true
        };
        if (iap.c) { clonedIap.c = iap.c; }
        if (iap.sc) { clonedIap.sc = iap.sc; }
        if (iap.sp) { clonedIap.sp = iap.sp; }
        if (iap.items?.length) { clonedIap.items = [...iap.items]; }
        iaps.push(clonedIap);
      });
    });


    const newShop: IShop = {
      guid: nanoid(10),
      type: 'Object',
      name: 'Placeholder',
      iaps
    };
    shops.push(newShop);


    this.instance = {
      guid: nanoid(10),
      date,
      endDate
    };

    if (this.calendarLink.value) {
      this.instance._calendar = {
        href: this.calendarLink.value
      };
    }

    if (spirits.length) { this.instance.spirits = spirits; }
    if (shops.length) { this.instance.shops = shops; }
  }

  copyInstance(): void {
    if (!this.instance) { return; }

    const obj: any = {
      guid: this.instance.guid,
      date: this.instance.date!.toFormat('yyyy-MM-dd'),
      endDate: this.instance.endDate!.toFormat('yyyy-MM-dd'),
      spirits: this.instance.spirits?.map(s => s.guid),
      shops: this.instance.shops?.map(s => s.guid)
    };

    if (this.isDraft) { obj.draft = true; }

    const json = JSON.stringify(obj, null, 2);
    navigator.clipboard.writeText(`,\n${json}`);
  }

  copyInstanceSpirits(): void {
    if (!this.instance) { return; }
    const jSpirits = JSON.stringify(this.instance.spirits?.map(s => {
      return {
        guid: s.guid,
        spirit: s.spirit?.guid,
        tree: s.tree.guid
      };
    }), null, 2).replace(/\s+/g, ' ').replace('{', '\n    {').replace(/\}\,/g, '},\n   ').replace(']', '\n  ]');

    navigator.clipboard.writeText(jSpirits);
  }

  copyShops(): void {
    if (!this.instance) { return; }
    if (!this.instance.shops) { alert('No shops found!'); return; }

    const obj = this.instance.shops.map(s => {
      const jsonShop: any = {
        guid: s.guid,
        type: s.type
      };
      if (s.spirit) { jsonShop.spirit = s.spirit.guid; }
      if (s.name) { jsonShop.name = s.name; }
      jsonShop.iaps = s.iaps?.map(i => i.guid);
      return jsonShop;
    });

    let json = JSON.stringify(obj, null, 2);
    json = JsonHelper.inArray(json);
    json = `${this.region}\n${json}\n${this.endRegion}`;

    navigator.clipboard.writeText(json);
  }

  copyIaps(): void {
    if (!this.instance) { return; }
    if (!this.instance.shops) { alert('No shops found!'); return; }

    const iaps = this.instance.shops.map(s => s.iaps).flat();

    const obj = iaps.filter(i => i).map(i => {
      const jsonIap: any = {
        ...i
      };
      jsonIap.items = i!.items?.map(i => i.guid);
      return jsonIap;
    });

    let json = JSON.stringify(obj, null, 2);
    json = JsonHelper.inArray(json);
    json = `${this.region}\n${json}\n${this.endRegion}`;

    navigator.clipboard.writeText(json);
  }

  copyTrees(): void {
    if (!this.instance) { return; }
    if (!this.instance.spirits) { alert('No spirits found!'); return; }

    const obj = this.instance.spirits.map(s => {
      return {
        guid: s.tree.guid,
        node: s.tree.node!.guid
      };
    });

    let json = JSON.stringify(obj, null, 2);
    json = JsonHelper.inArray(json);
    json = `${this.region}\n${json}\n${this.endRegion}`;

    navigator.clipboard.writeText(json);
  }

  copyNodes(): void {
    if (!this.instance) { return; }
    if (!this.instance.spirits) { alert('No spirits found!'); return; }

    const nodes = this.instance.spirits.map(s => NodeHelper.all(s.tree.node)).flat();

    const obj = nodes.map(n => {
      const jsonNode: any = {
        guid: n.guid,
        item: n.item?.guid,
      };
      if (n.hiddenItems?.length) { jsonNode.hiddenItems = n.hiddenItems.map(i => i.guid); }

      if (n.nw) { jsonNode.nw = n.nw.guid; }
      if (n.n) { jsonNode.n = n.n.guid; }
      if (n.ne) { jsonNode.ne = n.ne.guid; }

      if (n.c) { jsonNode.c = n.c; }
      if (n.h) { jsonNode.h = n.h; }
      if (n.sc) { jsonNode.sc = n.sc; }
      if (n.sh) { jsonNode.sh = n.sh; }
      if (n.ac) { jsonNode.ac = n.ac; }
      if (n.ec) { jsonNode.ec = n.ec; }

      return jsonNode;
    });

    let json = this._dataJsonService.nodesToJson(nodes);
    json = JsonHelper.inArray(json);
    json = `${this.region}\n${json}\n${this.endRegion}`;

    navigator.clipboard.writeText(json);
  }

  private get region(): string {
    return `// #region ${this.lastInstance?.event?.name} (${this.instance?.date?.toFormat('yyyy')})`;
  }

  private get endRegion(): string {
    return '// #endregion';
  }
}
