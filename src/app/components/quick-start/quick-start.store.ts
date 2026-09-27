import { Injectable, WritableSignal, computed, inject, signal } from '@angular/core';
import { DateTime } from 'luxon';
import { IItem, ISeason, ItemSubtype, ItemType } from 'skygame-data';
import { ExportHelper } from '@app/helpers/export-helper';
import { ItemHelper } from '@app/helpers/item-helper';
import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { ClosetImportKind, ClosetImportResult, ClosetImportService } from '@app/services/closet-import/closet-import.service';
import { solveEmote } from '@app/services/quick-start/emote-levels';
import { inferProgress } from '@app/services/quick-start/quick-start-inference';
import {
  EmoteEntry, EmoteSolution, IapChoice, QUICK_START_TABS, QuickStartAsk, QuickStartPlan, QuickStartTab, QuickStartTile, SeasonState, TileState
} from '@app/services/quick-start/quick-start.model';

export type TabStage = 'add' | 'check' | 'matching' | 'confirm';

export interface QuickStartShot {
  file: File;
  url: string;
}

export interface TabState {
  stage: TabStage;
  manual: boolean;
  shots: Array<QuickStartShot>;
  /** Screenshots matched so far. */
  progress: number;
  error?: string;
  /** Set in the confirm stage, and in the check stage while held back because some screenshots barely match the tab. */
  result?: ClosetImportResult;
  /** Closet order. Empty for the emote tab. */
  tiles: Array<QuickStartTile>;
  ask: Array<QuickStartAsk>;
  /** Emote tab only, in emote order. */
  emotes: Array<EmoteEntry>;
  search: string;
}

export interface TabStatus {
  /** Tiles still marked "!", unanswered asks, or unresolved emotes. */
  open: number;
  /** New owned items, or emotes with new levels. */
  fresh: number;
}

/** State of one quick start run. Kept by `QuickStartSession` between visits to the page. */
@Injectable()
export class QuickStartStore {
  private readonly _data = inject(DataService);
  private readonly _storage = inject(StorageService);
  private readonly _closetImport = inject(ClosetImportService);

  readonly tabs = QUICK_START_TABS;
  readonly screenshotsSupported = ClosetImportService.isSupported();

  /** Snapshot taken when quick start opens; these are evidence only and are never re-saved. */
  readonly unlockedBefore: ReadonlySet<string> = new Set(this._storage.getUnlocked());

  /** Seasons that have started, oldest first. */
  readonly seasons: Array<ISeason> = this._data.seasonConfig.items
    .filter(s => s.date <= DateTime.now())
    .sort((a, b) => a.date.toMillis() - b.date.toMillis());

  readonly step = signal(0);
  /** Furthest step opened so far; every step up to it can be revisited from the stepper. */
  readonly reached = signal(0);
  readonly startIndex = signal(Math.max(0, this.seasons.length - 1));
  readonly startUnsure = signal(false);
  readonly activeTab = signal(QUICK_START_TABS[0].key);
  readonly seasonStates = signal<ReadonlyMap<string, SeasonState>>(new Map());
  readonly spiritSource = signal<ReadonlyMap<string, string>>(new Map());
  readonly iapChoices = signal<ReadonlyMap<string, IapChoice>>(new Map());
  readonly wingBuffs = signal<ReadonlySet<string>>(new Set());
  readonly conflictHandled = signal(false);
  readonly saved = signal(false);

  private readonly _tabState = new Map<string, WritableSignal<TabState>>(
    QUICK_START_TABS.map(t => [t.key, signal(this.initialState(t))])
  );

  /** Items owned or already unlocked outside the emote tab; emote levels depend on these. */
  readonly ownedOutsideEmotes = computed<ReadonlySet<string>>(() => {
    const owned = new Set<string>(this.unlockedBefore);
    for (const tab of this.tabs) {
      if (tab.kind === 'emote') { continue; }
      const s = this.tab(tab.key)();
      s.tiles.forEach(t => { if (t.state === 'owned') { owned.add(t.item.guid); } });
      s.ask.forEach(a => { if (a.pick) { owned.add(a.pick.guid); } });
    }
    return owned;
  });

  readonly emoteSolutions = computed<Array<EmoteSolution>>(() => {
    const owned = this.ownedOutsideEmotes();
    return this.tab('Emote')().emotes.map(e => solveEmote(e, owned));
  });

  /** Newly confirmed items across every tab, including emote levels. Never includes already unlocked items. */
  readonly ownedNew = computed<Array<IItem>>(() => {
    const items: Array<IItem> = [];
    const seen = new Set<string>();
    const add = (item: IItem) => {
      if (seen.has(item.guid) || this.isLocked(item)) { return; }
      seen.add(item.guid);
      items.push(item);
    };
    for (const tab of this.tabs) {
      if (tab.kind === 'emote') { continue; }
      const s = this.tab(tab.key)();
      s.tiles.forEach(t => { if (t.state === 'owned') { add(t.item); } });
      s.ask.forEach(a => { if (a.pick) { add(a.pick); } });
    }
    this.emoteSolutions().forEach(sol => sol.levels.forEach(l => { if (l.on) { add(l.item); } }));
    return items;
  });

  readonly status = computed<Record<string, TabStatus>>(() => {
    const solutions = this.emoteSolutions();
    const result: Record<string, TabStatus> = {};
    for (const tab of this.tabs) {
      const s = this.tab(tab.key)();
      if (tab.kind === 'emote') {
        result[tab.key] = {
          open: s.emotes.filter((e, i) => e.unclear || !solutions[i]?.resolved).length,
          fresh: s.emotes.filter((e, i) => solutions[i]?.levels.some(l => l.on && !e.locked.has(l.level))).length
        };
      } else {
        result[tab.key] = {
          open: s.tiles.filter(t => t.state === 'unsure').length + s.ask.filter(a => a.pick === undefined).length,
          fresh: s.tiles.filter(t => t.state === 'owned').length + s.ask.filter(a => a.pick && !s.tiles.some(t => t.item === a.pick && t.state === 'owned')).length
        };
      }
    }
    return result;
  });

  /** Items still marked "!" (and unanswered asks, unresolved emotes); these aren't saved. */
  readonly openCount = computed(() => Object.values(this.status()).reduce((n, s) => n + s.open, 0));

  /** Without the Necklace tab a missing pendant says nothing about the season pass. */
  readonly necklaceCovered = computed(() => this.tab('Necklace')().stage === 'confirm');

  readonly plan = computed<QuickStartPlan>(() => inferProgress(this._data, {
    owned: this.ownedNew(),
    unlocked: this.unlockedBefore,
    start: this.startUnsure() ? undefined : this.seasons[this.startIndex()],
    seasonStates: this.seasonStates(),
    spiritSource: this.spiritSource(),
    iapChoices: this.iapChoices(),
    wingBuffs: this.wingBuffs(),
    conflictHandled: this.conflictHandled()
  }));

  dispose(): void {
    this._tabState.forEach(s => this.revoke(s()));
  }

  tab(key: string): WritableSignal<TabState> {
    return this._tabState.get(key)!;
  }

  tabDef(key: string): QuickStartTab {
    return this.tabs.find(t => t.key === key)!;
  }

  isLocked(item: IItem): boolean {
    return !!item.autoUnlocked || this.unlockedBefore.has(item.guid);
  }

  /* ---------- Screenshots ---------- */

  addFiles(key: string, files: Iterable<File>): void {
    const added = [...files].filter(f => f.type.startsWith('image/')).map(file => ({ file, url: URL.createObjectURL(file) }));
    if (!added.length) { return; }
    this.update(key, s => ({ ...s, shots: [...s.shots, ...added], stage: 'check', manual: false, error: undefined, result: undefined }));
  }

  removeShot(key: string, index: number): void {
    this.update(key, s => {
      URL.revokeObjectURL(s.shots[index].url);
      const shots = s.shots.filter((_, i) => i !== index);
      return { ...s, shots, stage: shots.length ? 'check' : 'add', result: undefined };
    });
  }

  clearShots(key: string): void {
    this.tab(key).update(s => { this.revoke(s); return this.initialState(this.tabDef(key)); });
  }

  /** "These screenshots show …": moves the screenshots to another tab. */
  moveShots(from: string, to: string): void {
    if (from === to) { return; }
    const shots = this.tab(from)().shots;
    this.tab(from).set(this.initialState(this.tabDef(from)));
    this.tab(to).update(s => { this.revoke(s); return { ...this.initialState(this.tabDef(to)), shots, stage: 'check' }; });
    this.activeTab.set(to);
  }

  /** Back from the confirm grid to the screenshot list; the matched result is dropped. */
  changeShots(key: string): void {
    this.update(key, s => { s.ask.forEach(a => a.crop && URL.revokeObjectURL(a.crop)); return { ...s, stage: 'check', result: undefined, tiles: [], ask: [] }; });
  }

  async match(key: string): Promise<void> {
    const def = this.tabDef(key);
    const files = this.tab(key)().shots.map(s => s.file);
    if (!files.length) { return; }
    this.update(key, s => ({ ...s, stage: 'matching', progress: 0, error: undefined }));
    try {
      const result = await this._closetImport.importBatch(this.importKind(def), files,
        done => this.update(key, s => ({ ...s, progress: done })), this.unlockedBefore);
      if (this.tab(key)().stage !== 'matching') { return; }
      // a screenshot of another tab would turn every tile into a question, so the user decides first
      if (result.offTab.length) {
        this.update(key, s => ({ ...s, stage: 'check', result }));
        return;
      }
      await this.confirm(key, result);
    } catch (e) {
      console.error(e);
      this.update(key, s => ({ ...s, stage: 'check', error: 'Matching failed. Try again, or mark the items by hand.' }));
    }
  }

  /** "Continue anyway": uses the held back result as it is. */
  async acceptOffTab(key: string): Promise<void> {
    const result = this.tab(key)().result;
    if (result) { await this.confirm(key, result); }
  }

  /** Removes the screenshots that barely match and continues with the rest, without matching them again. */
  async removeOffTab(key: string): Promise<void> {
    const s = this.tab(key)();
    if (!s.result) { return; }
    const off = new Set(s.result.offTab);
    const keep = (_: unknown, i: number) => !off.has(i);
    const shots = s.shots.filter(keep);
    if (!shots.length) { this.clearShots(key); return; }
    s.shots.forEach((x, i) => off.has(i) && URL.revokeObjectURL(x.url));
    const result = this._closetImport.combine(s.result.type, s.result.shots.filter(keep), this.unlockedBefore);
    this.update(key, t => ({ ...t, shots }));
    await this.confirm(key, result);
  }

  /* ---------- Manual ---------- */

  markByHand(key: string): void {
    const def = this.tabDef(key);
    this.tab(key).update(s => {
      this.revoke(s);
      const base = { ...this.initialState(def), manual: true, stage: 'confirm' as TabStage };
      if (def.kind === 'emote') { return { ...base, emotes: this.manualEmotes() }; }
      return { ...base, tiles: this.itemsFor(def).map(item => ({ item, state: (this.isLocked(item) ? 'lock' : 'no') as TileState })) };
    });
  }

  useScreenshots(key: string): void {
    this.clearShots(key);
  }

  /* ---------- Confirm ---------- */

  tapTile(key: string, index: number): void {
    this.update(key, s => {
      const t = s.tiles[index];
      if (!t || t.state === 'lock') { return s; }
      const state: TileState = t.state === 'owned' ? 'no' : 'owned';
      const tiles = s.tiles.slice();
      tiles[index] = { ...t, state, touched: true, guess: false };
      return { ...s, tiles };
    });
  }

  markAllUnsure(key: string, state: 'owned' | 'no'): void {
    this.update(key, s => ({ ...s, tiles: s.tiles.map(t => t.state === 'unsure' ? { ...t, state, touched: true } : t) }));
  }

  /** Answers an unidentified tile; `pick` null is "None of these". */
  pickAsk(key: string, index: number, pick: IItem | null): void {
    this.update(key, s => {
      const ask = s.ask.slice();
      const a = ask[index];
      ask[index] = { ...a, pick };
      const candidates = new Set(a.candidates.map(c => c.guid));
      const tiles = s.tiles.map(t => candidates.has(t.item.guid) && t.state !== 'lock'
        ? { ...t, state: (t.item === pick ? 'owned' : 'no') as TileState, touched: true, guess: false }
        : t);
      return { ...s, ask, tiles };
    });
  }

  toggleEmoteLevel(index: number, level: number, on: boolean): void {
    this.update('Emote', s => {
      const e = s.emotes[index];
      if (!e || e.locked.has(level)) { return s; }
      const picked = new Map(e.picked).set(level, on);
      const emotes = s.emotes.slice();
      emotes[index] = { ...e, picked, unclear: false };
      return { ...s, emotes };
    });
  }

  setSearch(key: string, search: string): void {
    this.update(key, s => ({ ...s, search }));
  }

  /* ---------- Review ---------- */

  setSeasonState(seasonGuid: string, state: SeasonState): void {
    this.seasonStates.update(m => new Map(m).set(seasonGuid, state));
  }

  setSpiritSource(spiritGuid: string, key: string): void {
    this.spiritSource.update(m => new Map(m).set(spiritGuid, key));
  }

  setIapChoice(iapGuids: Array<string>, choice: IapChoice): void {
    this.iapChoices.update(m => { const n = new Map(m); iapGuids.forEach(g => n.set(g, choice)); return n; });
  }

  setWingBuff(spiritGuid: string, on: boolean): void {
    this.wingBuffs.update(s => { const n = new Set(s); if (on) { n.add(spiritGuid); } else { n.delete(spiritGuid); } return n; });
  }

  /** Moves the start to the given season. Seasons from there on that were set to "Not played" fall back to played (or season pass with an ultimate gift). */
  useStart(season: ISeason): void {
    const i = this.seasons.indexOf(season);
    if (i < 0) { return; }
    this.startUnsure.set(false);
    this.startIndex.set(i);
    this.seasonStates.update(m => new Map([...m].filter(([guid, state]) =>
      state !== 'none' || this.seasons.findIndex(s => s.guid === guid) < i)));
    this.conflictHandled.set(false);
  }

  exportData(): void {
    ExportHelper.download(this._storage);
  }

  /** Only adds progress: one `addUnlocked` batch plus season passes. */
  save(): void {
    const plan = this.plan();
    const unlock = plan.unlock.filter(g => !this._storage.isUnlocked(g));
    if (unlock.length) {
      this._storage.addUnlocked(...unlock);
      this._data.refreshUnlocked({ unlocked: this._storage.getUnlocked(), gifted: this._storage.getGifted() });
    }
    const passes = plan.seasonPasses.filter(g => !this._storage.hasSeasonPass(g));
    if (passes.length) { this._storage.addSeasonPasses(...passes); }
    this.saved.set(true);
  }

  /* ---------- Internals ---------- */

  private update(key: string, fn: (s: TabState) => TabState): void {
    this.tab(key).update(fn);
  }

  private initialState(tab: QuickStartTab): TabState {
    const state: TabState = { stage: 'add', manual: false, shots: [], progress: 0, tiles: [], ask: [], emotes: [], search: '' };
    if (tab.kind === 'music') {
      return { ...state, stage: 'confirm', manual: true, tiles: this.itemsFor(tab).map(item => ({ item, state: this.isLocked(item) ? 'lock' : 'no' })) };
    }
    // the matcher can't read emote tabs or level dots yet, so emotes start in the manual picker
    if (tab.kind === 'emote') {
      return { ...state, stage: 'confirm', manual: true, emotes: this.manualEmotes() };
    }
    return state;
  }

  private async confirm(key: string, result: ClosetImportResult): Promise<void> {
    const files = this.tab(key)().shots.map(s => s.file);
    const ask = await Promise.all(result.ask.map(async a => ({
      shot: a.shot, cell: a.cell, candidates: a.candidates, pick: undefined, crop: await this.crop(files[a.shot], result, a.shot, a.cell)
    } as QuickStartAsk)));
    this.update(key, s => ({ ...s, stage: 'confirm', result, tiles: this.tilesFromResult(result), ask }));
  }

  private importKind(tab: QuickStartTab): ClosetImportKind {
    return tab.kind === 'stanceCall' ? 'StanceCall' : tab.types[0];
  }

  /** Items of a tab in closet order. */
  private itemsFor(tab: QuickStartTab): Array<IItem> {
    if (tab.kind === 'closet' || tab.kind === 'stanceCall') { return this._closetImport.getItems(this.importKind(tab)); }
    return this._data.itemConfig.items.filter(i => tab.types.includes(i.type)).sort(ItemHelper.sorter);
  }

  private tilesFromResult(result: ClosetImportResult): Array<QuickStartTile> {
    const owned = new Set(result.owned.map(i => i.guid));
    const weak = new Set(result.weak.map(i => i.guid));
    const checklist = new Map(result.checklist.map(c => [c.item.guid, c.looksOwned]));
    return result.items.map(item => {
      if (this.isLocked(item)) { return { item, state: 'lock' }; }
      const looksOwned = checklist.get(item.guid);
      if (looksOwned !== undefined) { return { item, state: looksOwned ? 'owned' : 'no', guess: true }; }
      if (weak.has(item.guid)) { return { item, state: 'unsure', reason: 'match' }; }
      return { item, state: owned.has(item.guid) ? 'owned' : 'no' };
    });
  }

  /** One entry per emote with its level items; friend emotes aren't in the emote menu. */
  private manualEmotes(): Array<EmoteEntry> {
    const byName = new Map<string, Array<IItem>>();
    this._data.itemConfig.items
      .filter(i => i.type === ItemType.Emote && i.subtype !== ItemSubtype.FriendEmote)
      .sort(ItemHelper.sorter)
      .forEach(i => { const list = byName.get(i.name) ?? []; list.push(i); byName.set(i.name, list); });
    return [...byName.values()].map(levels => {
      levels.sort((a, b) => (a.level ?? 1) - (b.level ?? 1));
      const locked = new Set(levels.filter(l => this.isLocked(l)).map(l => l.level ?? 1));
      return { levels, dots: null, unclear: false, locked, picked: new Map() };
    });
  }

  private async crop(file: File, result: ClosetImportResult, shot: number, cell: [number, number]): Promise<string | undefined> {
    const match = result.shots[shot];
    if (!match) { return undefined; }
    try {
      const r = this._closetImport.tileRect(match, cell);
      const bitmap = await createImageBitmap(file, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height));
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
      bitmap.close();
      return URL.createObjectURL(await canvas.convertToBlob({ type: 'image/png' }));
    } catch {
      return undefined;
    }
  }

  private revoke(s: TabState): void {
    s.shots.forEach(x => URL.revokeObjectURL(x.url));
    s.ask.forEach(a => a.crop && URL.revokeObjectURL(a.crop));
  }
}
