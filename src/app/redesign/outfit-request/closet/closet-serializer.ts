import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { IItem } from 'skygame-data';
import { IDye, DyeColor, ISelection } from './closet-state.service';

export interface IOutfitRequest {
  a?: string;
  r: string;
  y: string;
  g: string;
  b: string;
  d?: string;
}

/**
 * Plain class (not @Injectable) that lifts the base36 item/dye serialisation
 * and KV API calls verbatim from legacy ClosetComponent lines 567–897.
 */
export class ClosetSerializer {

  constructor(
    private readonly http: HttpClient,
    private readonly allItems: IItem[]
  ) {}

  // ── Item serialization ───────────────────────────────────────────────────

  serializeItems(items: IItem[]): string {
    return items.map(item => (item.id || 0).toString(36).padStart(3, '0')).join('');
  }

  deserializeItems(serialized: string | undefined): IItem[] {
    if (!serialized?.length) { return []; }
    const ids = serialized.match(/.{3}/g) || [];
    const itemIdMap = this.allItems.reduce((map, item) => {
      if (item.id) { map[item.id] = item; }
      return map;
    }, {} as Record<number, IItem>);

    const result: IItem[] = [];
    for (const id of ids) {
      const item = itemIdMap[parseInt(id, 36)];
      if (item) { result.push(item); }
    }
    return result;
  }

  // ── Dye serialization ────────────────────────────────────────────────────

  serializeDyes(selected: { r: ISelection; y: ISelection; g: ISelection; b: ISelection }, dyes: Record<string, IDye[]>): string {
    const guids = new Set<string>();
    const dyeArrays: IDye[][] = [
      ...Object.values(selected.r).filter(item => !guids.has(item.guid) && guids.add(item.guid)).map(item => dyes[item.guid] || []),
      ...Object.values(selected.y).filter(item => !guids.has(item.guid) && guids.add(item.guid)).map(item => dyes[item.guid] || []),
      ...Object.values(selected.g).filter(item => !guids.has(item.guid) && guids.add(item.guid)).map(item => dyes[item.guid] || []),
      ...Object.values(selected.b).filter(item => !guids.has(item.guid) && guids.add(item.guid)).map(item => dyes[item.guid] || [])
    ];

    if (!dyeArrays.some(d => d.length && d.some(c => c.primary || c.secondary))) { return ''; }

    return dyeArrays.map(dye => {
      const a = this.getDyeIndex(dye[0]?.primary);
      const b = this.getDyeIndex(dye[0]?.secondary);
      const c = this.getDyeIndex(dye[1]?.primary);
      const d = this.getDyeIndex(dye[1]?.secondary);
      return a.toString(36) + b.toString(36) + c.toString(36) + d.toString(36);
    }).join('');
  }

  deserializeDyes(serialized: string | undefined): IDye[][] {
    if (!serialized?.length) { return []; }
    const dyes = serialized.match(/.{4}/g) || [];
    const result: IDye[][] = [];
    for (const dye of dyes) {
      const a = parseInt(dye[0], 36);
      const b = parseInt(dye[1], 36);
      const c = parseInt(dye[2], 36);
      const d = parseInt(dye[3], 36);
      result.push([
        { primary: this.getDye(a), secondary: this.getDye(b) },
        { primary: this.getDye(c), secondary: this.getDye(d) }
      ]);
    }
    return result;
  }

  private getDyeIndex(color: DyeColor | undefined): number {
    switch (color) {
      case 'red': return 1;
      case 'purple': return 2;
      case 'blue': return 3;
      case 'cyan': return 4;
      case 'green': return 5;
      case 'yellow': return 6;
      case 'black': return 7;
      case 'white': return 8;
      default: return 0;
    }
  }

  private getDye(index: number): DyeColor | undefined {
    switch (index) {
      case 1: return 'red';
      case 2: return 'purple';
      case 3: return 'blue';
      case 4: return 'cyan';
      case 5: return 'green';
      case 6: return 'yellow';
      case 7: return 'black';
      case 8: return 'white';
      default: return undefined;
    }
  }

  // ── KV API ───────────────────────────────────────────────────────────────

  async loadFromKV(key: string): Promise<IOutfitRequest | null> {
    const sKey = encodeURIComponent(key);
    try {
      const data = await lastValueFrom(
        this.http.get<IOutfitRequest>(`/api/outfit-request?key=${sKey}`, { responseType: 'json' })
      );
      return data || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async saveToKV(request: IOutfitRequest): Promise<string | null> {
    try {
      const result = await lastValueFrom(
        this.http.post<{ key: string }>('/api/outfit-request', request, { responseType: 'json' })
      );
      return result.key;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  // ── URL helpers ──────────────────────────────────────────────────────────

  buildShareUrl(
    requesting: boolean,
    request: IOutfitRequest,
    key?: string
  ): URL {
    const link = new URL(location.href);
    link.pathname = requesting ? '/outfit-request/closet' : '/outfit-request/request';
    link.search = '';
    if (key) {
      link.searchParams.set('k', key);
    } else {
      link.searchParams.set('r', request.r);
      link.searchParams.set('y', request.y);
      link.searchParams.set('g', request.g);
      link.searchParams.set('b', request.b);
      if (request.d) { link.searchParams.set('d', request.d); }
    }
    return link;
  }
}
