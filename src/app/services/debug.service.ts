import { Injectable, Injector, NgZone } from "@angular/core";
import { ClosetImportKind, ClosetImportResult, ClosetImportService } from './closet-import/closet-import.service';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private _copyItem = false;
  private _copyNode = false;
  private _copyShop = false;
  private _copyTree = false;

  constructor(
    private readonly _zone: NgZone,
    private readonly _injector: Injector
  ) {
    (window as any).debug = this;
  }

  set copyItem(value: boolean) {
    this._zone.run(() => {
      this._copyItem = !!value;
    });
  }

  get copyItem(): boolean {
    return this._copyItem;
  }

  set copyNode(value: boolean) {
    this._zone.run(() => {
      this._copyNode = !!value;
    });
  }

  get copyNode(): boolean {
    return this._copyNode;
  }

  set copyShop(value: boolean) {
    this._zone.run(() => {
      this._copyShop = !!value;
    });
  }

  get copyShop(): boolean {
    return this._copyShop;
  }

  get copyTree(): boolean {
    return this._copyTree;
  }

  set copyTree(value: boolean) {
    this._zone.run(() => {
      this._copyTree = !!value;
    });
  }

  /** Picks closet screenshots of one tab (e.g. `debug.closetImport('Cape')`) and logs what the importer recognises. */
  async closetImport(kind: ClosetImportKind): Promise<ClosetImportResult | undefined> {
    const files = await new Promise<Array<File>>(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/png,image/jpeg,image/webp';
      input.onchange = () => resolve(Array.from(input.files ?? []));
      input.oncancel = () => resolve([]);
      input.click();
    });
    if (!files.length) { return undefined; }

    const service = this._injector.get(ClosetImportService);
    console.time('closetImport');
    const result = await service.importBatch(kind, files, (done, total) => console.log(`closetImport: ${done}/${total}`));
    console.timeEnd('closetImport');
    result.shots.forEach((shot, i) => {
      if (!shot) { console.log(`${files[i].name}: no closet grid found`); return; }
      const { grid, tiles, partial, timing } = shot;
      console.log(`${files[i].name}: pitch ${grid.px.toFixed(1)}x${grid.py.toFixed(1)}, ${grid.cells.length} cells, ${tiles.length} tiles `
        + `(${tiles.filter(t => t.item !== null).length} matched, ${tiles.filter(t => t.forced).length} forced, ${tiles.filter(t => t.relaxed).length} relaxed), ${partial} partial; `
        + `grid ${timing.grid.toFixed(0)} ms, match ${timing.match.toFixed(0)} ms`);
    });
    console.log('Owned', result.owned.map(i => i.name));
    console.log('Weak (owned, unsure)', result.weak.map(i => i.name));
    console.log('Checklist', result.checklist.map(c => `[${c.looksOwned ? 'x' : ' '}] ${c.item.name}`));
    console.log('Ask', result.ask.map(a => `${files[a.shot].name} ${a.cell}: ${a.candidates.map(i => i.name).join(', ')} (window ${a.window.length})`));
    console.log('Not owned (offer)', result.gaps.map(i => i.name));
    return result;
  }
}
