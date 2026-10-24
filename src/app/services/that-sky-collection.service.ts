import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface ITscCount {
  /** Posted outfits wearing every known item of the query. */
  count: number;
  /** Item GUIDs That Sky Collection doesn't have; left out of the count and link. */
  unknown: string[];
  /** Gallery filtered to the known items, or null when none are known. */
  link: string | null;
}

const MAX_QUERIES = 10;

/** Client for That Sky Collection's outfit-count API. */
@Injectable({ providedIn: 'root' })
export class ThatSkyCollectionService {
  private readonly _cache = new Map<string, ITscCount>();
  private _blockedUntil = 0;

  /** Cached count for a query (a list of item GUIDs, one per type). */
  get(query: string[]): ITscCount | undefined {
    return this._cache.get(query.join(','));
  }

  isAvailable(): boolean {
    return Date.now() >= this._blockedUntil;
  }

  /**
   * Fetches the counts of queries that aren't cached yet, the first ten when there are more.
   * Resolves false when the API can't be used right now, so callers can hide their UI.
   */
  async fetchCounts(queries: string[][], signal?: AbortSignal): Promise<boolean> {
    if (!this.isAvailable()) { return false; }

    const missing = new Map<string, string[]>();
    for (const query of queries) {
      const key = query.join(',');
      if (!this._cache.has(key)) { missing.set(key, query); }
    }
    const keys = [...missing.keys()].slice(0, MAX_QUERIES);
    if (!keys.length) { return true; }

    let response: Response;
    try {
      response = await fetch(`${environment.urls.tsc}/api/sky-planner/outfit-counts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries: keys.map(k => missing.get(k)) }),
        signal
      });
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') { throw e; }
      console.error(e);
      this._blockedUntil = Infinity;
      return false;
    }

    if (response.status === 429) {
      const retryAfter = +(response.headers.get('Retry-After') || 60);
      this._blockedUntil = Date.now() + retryAfter * 1000;
      return false;
    }
    // Blocked origin or maintenance; asking again during this visit won't help.
    if (response.status === 403 || response.status === 503) {
      this._blockedUntil = Infinity;
      return false;
    }
    if (!response.ok) { return false; }

    const { counts } = await response.json() as { counts: ITscCount[] };
    counts.forEach((c, i) => this._cache.set(keys[i], c));
    return true;
  }
}
