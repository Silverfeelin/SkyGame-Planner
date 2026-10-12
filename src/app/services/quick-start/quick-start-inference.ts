import type { DataService } from '@app/services/data.service';
import { DateTime } from 'luxon';
import { IIAP, IItem, IItemListNode, INode, IRevisedSpiritTree, ISeason, ISpirit, ISpiritTree, ItemType } from 'skygame-data';
import { NodeHelper } from '@app/helpers/node-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import {
  Attribution, IapChoice, IapQuestion, OnTheWay, QuickStartInput, QuickStartPlan, SeasonState, SeasonSummary, SourceOption, WingBuffQuestion
} from './quick-start.model';

/** The data the inference reads. The store passes the DataService; scripts build it from `SkyDataResolver.resolve`. */
export type QuickStartData = Pick<DataService, 'seasonConfig' | 'itemConfig'>;

interface Candidate {
  option: SourceOption;
  /** For season trees: the spirit's main tree rather than a revision. */
  main: boolean;
}

interface Context {
  startDate: DateTime;
  pendants: ReadonlySet<ISeason>;
  seasonState: (season: ISeason) => SeasonState;
  spiritSource: ReadonlyMap<string, string>;
}

export function inferProgress(data: QuickStartData, input: QuickStartInput): QuickStartPlan {
  const unlocked = input.unlocked;
  const owned = distinct(input.owned).filter(i => !i.autoUnlocked && !unlocked.has(i.guid));
  const ownedGuids = new Set(owned.map(i => i.guid));
  const before = data.itemConfig.items.filter(i => !i.autoUnlocked && unlocked.has(i.guid) && !ownedGuids.has(i.guid));
  const evidence = [...owned, ...before];

  const pendants = new Set<ISeason>(evidence.filter(isPendant).map(i => i.season!));

  let earliest: { item: IItem, season: ISeason } | undefined;
  for (const item of evidence) {
    const season = evidenceSeason(item);
    if (season && (!earliest || season.date < earliest.season.date)) { earliest = { item, season }; }
  }

  const started = startedSeasons(data);
  const start = input.start ?? earliest?.season ?? started.at(-1)!;
  const derivedStart = !input.start && !!earliest;
  const conflict = input.start && earliest && earliest.season.date < input.start.date && !input.conflictHandled ? earliest : undefined;

  const ultimateSeasons = new Set(evidence.filter(i => i.group === 'Ultimate' && i.season).map(i => i.season!));
  const summary = new Map<ISeason, SeasonSummary>(started.map(season => {
    const inferred: SeasonState = season.date < start.date ? 'none' : ultimateSeasons.has(season) ? 'pass' : 'played';
    const state = input.seasonStates.get(season.guid) ?? inferred;
    return [season, { season, state, inferred, pendant: pendants.has(season), items: 0, ultimates: 0 }];
  }));
  const seasonState = (season: ISeason) => summary.get(season)?.state ?? (season.date >= start.date ? 'played' : 'none');

  const ctx: Context = { startDate: start.date, pendants, seasonState, spiritSource: input.spiritSource };

  const unlock = new Set<string>();
  const unlockNodes = new Set<string>();
  const add = (guid: string) => { if (!unlocked.has(guid)) { unlock.add(guid); } };
  const addItem = (item?: IItem) => { if (item && !item.autoUnlocked) { add(item.guid); } };
  const addNode = (node: INode | IItemListNode) => {
    if (!unlocked.has(node.guid)) { unlock.add(node.guid); unlockNodes.add(node.guid); }
    addItem(node.item);
    (node as INode).hiddenItems?.forEach(addItem);
  };

  const attributions: Array<Attribution> = [];
  const seasonItems = new Map<ISeason, number>();
  const countSeason = (item: IItem, attribution?: Attribution) => {
    if (attribution?.season && attribution.source.key === 'season' && item.group !== 'Ultimate') {
      seasonItems.set(attribution.season, (seasonItems.get(attribution.season) ?? 0) + 1);
    }
  };
  before.forEach(item => countSeason(item, attribute(item, ctx)));

  const iaps = resolveIaps(owned, unlocked, start.date, input.iapChoices);
  iaps.unlock.forEach(add);
  const kept = owned.filter(i => !iaps.removed.has(i.guid));

  const resolved = kept.map(item => {
    const attribution = attribute(item, ctx);
    const node = attribution?.source.node ?? pickNode(item, ctx);
    return { item, attribution, node, path: node ? pathTo(node) : [] };
  });
  const coveredBy = coverPaths(resolved, ownedGuids);

  const targets: Array<{ item: IItem, node: INode }> = [];
  for (const { item, attribution, node } of resolved) {
    addItem(item);
    if (coveredBy.has(item.guid)) { countSeason(item, coveredBy.get(item.guid)); continue; }
    countSeason(item, attribution);
    if (attribution) { attributions.push(attribution); }
    if (node) { targets.push({ item, node }); continue; }
    const listNode = pickListNode(item, ctx);
    if (listNode) { addNode(listNode); }
  }

  const onTheWay = collectPaths(targets, addNode, n => unlocked.has(n.guid) || isOwnedItem(n.item, ownedGuids, unlocked));

  const wingBuffQuestions = askWingBuffs(attributions, ctx, i => unlock.has(i.guid) || unlocked.has(i.guid), n => unlock.has(n.guid) || unlocked.has(n.guid));
  let wingBuffs = 0;
  for (const q of wingBuffQuestions) {
    if (!input.wingBuffs.has(q.spirit.guid)) { continue; }
    q.nodes.forEach(addNode);
    wingBuffs++;
  }

  evidence.filter(i => i.group === 'Ultimate' && i.season && !isPendant(i)).forEach(i => { const s = summary.get(i.season!); if (s) { s.ultimates++; } });
  seasonItems.forEach((n, season) => { const s = summary.get(season); if (s) { s.items += n; } });
  const seasons = [...summary.values()];

  const seasonPasses = seasons.filter(s => s.state === 'pass').map(s => s.season.guid);

  return {
    start,
    derivedStart,
    conflict,
    seasons,
    attributions,
    wingBuffQuestions,
    iapQuestions: iaps.questions,
    onTheWay,
    unlock: [...unlock],
    seasonPasses,
    counts: { items: kept.length + iaps.proxied, nodes: unlockNodes.size, seasonPasses: seasonPasses.length, wingBuffs, iaps: iaps.bought }
  };
}

/* ---------- Evidence ---------- */

/** The pendant is the free Ultimate necklace; paid ones (e.g. the Remembrance sash) are Ultimate gifts. */
function isPendant(item: IItem): boolean {
  return item.type === ItemType.Necklace && item.group === 'Ultimate' && !!item.season
    && !!item.nodes?.length && item.nodes.every(n => !n.c && !n.h && !n.sc && !n.sh && !n.ac && !n.ec);
}

/** Season the item proves the player played in (E1–E3), if any. */
function evidenceSeason(item: IItem): ISeason | undefined {
  const candidates = getCandidates(item);
  const season = candidates.find(c => c.option.role === 'season');
  if (!season) { return undefined; }
  const itemSeason = item.season ?? spiritOf(season.option.tree)?.season;
  if (!itemSeason) { return undefined; }
  if (item.group === 'Ultimate') { return itemSeason; }
  const later = candidates.some(c => c.option.role === 'visit' || c.option.role === 'after') || !!item.listNodes?.length;
  return later ? undefined : itemSeason;
}

/** Oldest first. */
function startedSeasons(data: QuickStartData): Array<ISeason> {
  const now = DateTime.now();
  const started = data.seasonConfig.items.filter(s => s.date <= now);
  return [...(started.length ? started : data.seasonConfig.items)].sort((a, b) => a.date.toMillis() - b.date.toMillis());
}

/* ---------- Attribution ---------- */

/** Picks the source of an item from a season spirit (season tree, visits or the tree left after the season). */
function attribute(item: IItem, ctx: Context): Attribution | undefined {
  const candidates = getCandidates(item);
  const seasonC = candidates.filter(c => c.option.role === 'season').sort((a, b) => +b.main - +a.main)[0];
  const visits = candidates.filter(c => c.option.role === 'visit');
  const after = candidates.find(c => c.option.role === 'after');
  if (!seasonC && !visits.length && !after) { return undefined; }

  const spirit = spiritOf((seasonC ?? visits[0] ?? after).option.tree);
  const season = item.season ?? spirit?.season;
  const options = [seasonC, ...visits, after].filter((c): c is Candidate => !!c)
    .sort((a, b) => (a.option.date?.toMillis() ?? 0) - (b.option.date?.toMillis() ?? 0))
    .map(c => c.option);

  const seasonName = season?.name ?? 'the season';
  const isPass = item.group === 'SeasonPass';
  const state = season ? ctx.seasonState(season) : 'none';
  const played = state !== 'none';
  const noPass = isPass && state !== 'pass';

  let source: SourceOption;
  let reason: string;
  let warn = false;
  if (seasonC && item.group === 'Ultimate') {
    source = seasonC.option;
    reason = isPendant(item) ? 'The pendant comes with the season pass.' : 'Ultimate gifts are only available during the season.';
  } else if (seasonC && played && !noPass) {
    source = seasonC.option;
    reason = !isPass ? `You played during ${seasonName}.`
      : season && ctx.pendants.has(season) ? `You have the pendant from ${seasonName}, so you had the season pass.`
      : `You had the season pass for ${seasonName}.`;
  } else {
    // The tree left after the season is available from the start date onward, so it counts as the start date.
    const later = [...visits, after].filter((c): c is Candidate => !!c)
      .map(c => ({ c, date: c.option.role === 'after' ? DateTime.max(c.option.date ?? ctx.startDate, ctx.startDate) : c.option.date! }))
      .filter(x => x.date >= ctx.startDate)
      .sort((a, b) => a.date.toMillis() - b.date.toMillis());
    if (later.length) {
      source = later[0].c.option;
      reason = !season || !seasonC ? 'It came with a later visit.'
        : !played ? `You didn't play during ${seasonName}.`
        : `It's a season pass item and you didn't have the season pass for ${seasonName}.`;
    } else {
      source = (seasonC ?? visits.at(-1) ?? after)!.option;
      warn = true;
      reason = visits.length || after ? `This doesn't fit your start date. No visit after ${ctx.startDate.toFormat('LLL yyyy')} had it.`
        : played ? `It never returned, but you didn't have the season pass for ${seasonName}.`
        : `Only available during ${seasonName}, which you didn't play.`;
    }
  }

  let overridden = false;
  const override = spirit && ctx.spiritSource.get(spirit.guid);
  const picked = override !== undefined ? options.find(o => o.key === override) : undefined;
  if (picked) {
    source = picked;
    reason = 'You picked this source.';
    warn = false;
    overridden = true;
  }

  return { item, spirit: spiritOf(source.tree) ?? spirit, season, source, options, reason, warn, overridden };
}

/** Node for items outside season attribution: the permanent tree for regular spirits, the first event instance since the start for events. */
function pickNode(item: IItem, ctx: Context): INode | undefined {
  const candidates = getCandidates(item);
  const regular = candidates.filter(c => c.option.role === 'regular').sort((a, b) => +b.main - +a.main);
  if (regular.length) { return regular[0].option.node; }
  const events = candidates.filter(c => c.option.role === 'event').sort((a, b) => (a.option.date?.toMillis() ?? 0) - (b.option.date?.toMillis() ?? 0));
  if (events.length) { return (events.find(c => c.option.date && c.option.date >= ctx.startDate) ?? events[0]).option.node; }
  return candidates[0]?.option.node;
}

function pickListNode(item: IItem, ctx: Context): IItemListNode | undefined {
  const dated = (item.listNodes ?? []).map(node => ({ node, date: node.itemList?.shop?.date ?? node.itemList?.shop?.event?.date }))
    .sort((a, b) => (a.date?.toMillis() ?? 0) - (b.date?.toMillis() ?? 0));
  return (dated.find(x => !x.date || x.date >= ctx.startDate) ?? dated.at(-1))?.node;
}

/* ---------- Paths ---------- */

/**
 * Owned items on the path of another owned item (usually emote levels) follow that item's source instead of their own.
 * Emotes go last and deeper nodes first, so the item that forced a level decides where it came from.
 * @returns Covered item GUID → attribution of the item that covers it.
 */
function coverPaths(
  resolved: Array<{ item: IItem, attribution?: Attribution, node?: INode, path: Array<INode> }>,
  owned: ReadonlySet<string>
): Map<string, Attribution | undefined> {
  const order = [...resolved].sort((a, b) =>
    +(a.item.type === ItemType.Emote) - +(b.item.type === ItemType.Emote) || b.path.length - a.path.length);
  const coveredBy = new Map<string, Attribution | undefined>();
  const kept = new Set<string>();
  for (const r of order) {
    if (coveredBy.has(r.item.guid)) { continue; }
    kept.add(r.item.guid);
    for (const n of r.path) {
      [n.item, ...(n.hiddenItems ?? [])].forEach(i => {
        if (i && i !== r.item && owned.has(i.guid) && !kept.has(i.guid) && !coveredBy.has(i.guid)) { coveredBy.set(i.guid, r.attribution); }
      });
    }
  }
  return coveredBy;
}

/** Unlocks each target with its path and groups the prerequisites nobody confirmed per tree. */
function collectPaths(
  targets: Array<{ item: IItem, node: INode }>,
  addNode: (node: INode) => void,
  known: (node: INode) => boolean
): Array<OnTheWay> {
  const targetNodes = new Set(targets.map(t => t.node));
  const byTree = new Map<ISpiritTree, { nodes: Set<INode>, before: IItem, depth: number }>();
  for (const { item, node } of targets) {
    const path = pathTo(node);
    path.forEach(addNode);
    const extra = path.filter(n => !targetNodes.has(n) && !known(n));
    const tree = treeOf(node);
    if (!tree || !extra.length) { continue; }
    let entry = byTree.get(tree);
    if (!entry) { entry = { nodes: new Set(), before: item, depth: 0 }; byTree.set(tree, entry); }
    extra.forEach(n => entry!.nodes.add(n));
    if (path.length > entry.depth) { entry.depth = path.length; entry.before = item; }
  }
  return [...byTree].map(([tree, e]) => ({ spirit: spiritOf(tree), tree, nodes: [...e.nodes], before: e.before }))
    .sort((a, b) => b.nodes.length - a.nodes.length);
}

function isOwnedItem(item: IItem | undefined, owned: ReadonlySet<string>, unlocked: ReadonlySet<string>): boolean {
  return !!item && (!!item.autoUnlocked || owned.has(item.guid) || unlocked.has(item.guid));
}

/* ---------- IAPs ---------- */

/**
 * Picks one IAP per owned IAP item: the first sold since the start, preferring one whose items are all owned.
 * Returning IAPs usually repeat the same items, so an incomplete pick means an item is missing or was marked by mistake.
 */
function resolveIaps(
  owned: ReadonlyArray<IItem>,
  unlocked: ReadonlySet<string>,
  startDate: DateTime,
  choices: ReadonlyMap<string, IapChoice>
): { unlock: Array<string>, removed: Set<string>, questions: Array<IapQuestion>, bought: number, proxied: number } {
  const ownedGuids = new Set(owned.map(i => i.guid));
  const has = (item: IItem) => !!item.autoUnlocked || ownedGuids.has(item.guid) || unlocked.has(item.guid);
  const complete = (iap: IIAP) => (iap.items ?? []).every(has);

  const picked = new Map<IIAP, Array<IItem>>();
  for (const item of owned) {
    const iaps = item.iaps ?? [];
    if (!iaps.length || item.nodes?.length || item.hiddenNodes?.length || item.listNodes?.length) { continue; }
    if (iaps.some(i => unlocked.has(i.guid))) { continue; }
    const dated = iaps.map(iap => ({ iap, date: iapDate(iap) }))
      .sort((a, b) => (a.date?.toMillis() ?? Infinity) - (b.date?.toMillis() ?? Infinity));
    const since = dated.filter(x => !x.date || x.date >= startDate);
    const pool = since.length ? since : dated;
    const iap = (pool.find(x => complete(x.iap)) ?? pool[0]).iap;
    picked.set(iap, [...(picked.get(iap) ?? []), item]);
  }

  const unlock: Array<string> = [];
  const removed = new Set<string>();
  const questions: Array<IapQuestion> = [];
  let bought = 0;
  let proxied = 0;
  for (const [iap, items] of picked) {
    const missing = (iap.items ?? []).filter(i => !has(i));
    if (!missing.length) { unlock.push(iap.guid); bought++; continue; }
    const choice = choices.get(iap.guid);
    questions.push({ iap, date: iapDate(iap), where: iapWhere(iap), owned: items, missing, choice });
    if (choice === 'unlock') {
      unlock.push(iap.guid, ...missing.map(i => i.guid));
      bought++;
      proxied += missing.length;
    } else if (choice === 'remove') {
      items.forEach(i => removed.add(i.guid));
    }
  }
  questions.sort((a, b) => (a.date?.toMillis() ?? Infinity) - (b.date?.toMillis() ?? Infinity));
  return { unlock, removed, questions, bought, proxied };
}

function iapDate(iap: IIAP): DateTime | undefined {
  const shop = iap.shop;
  return shop?.date ?? shop?.event?.date ?? shop?.season?.date;
}

function iapWhere(iap: IIAP): string | undefined {
  const shop = iap.shop;
  return shop?.event?.name ?? shop?.event?.event?.name ?? shop?.season?.name ?? shop?.spirit?.name;
}

/* ---------- Wing buffs ---------- */

function askWingBuffs(
  attributions: Array<Attribution>,
  ctx: Context,
  itemCovered: (item: IItem) => boolean,
  nodeCovered: (node: INode) => boolean
): Array<WingBuffQuestion> {
  const bySpirit = new Map<ISpirit, Array<Attribution>>();
  attributions.forEach(a => {
    if (!a.spirit) { return; }
    const list = bySpirit.get(a.spirit) ?? [];
    list.push(a);
    bySpirit.set(a.spirit, list);
  });

  const questions: Array<WingBuffQuestion> = [];
  for (const [spirit, list] of bySpirit) {
    const trees = spiritTrees(spirit);
    // A spirit gives one wing buff, shared by all of its visits.
    if (trees.some(t => TreeHelper.getNodes(t).some(n => n.item?.type === ItemType.WingBuff && itemCovered(n.item)))) { continue; }

    const buffVisits = trees.map(tree => {
      const node = TreeHelper.getNodes(tree).find(n => n.item?.type === ItemType.WingBuff);
      const c = node && classify(node, tree);
      return c?.option.role === 'visit' ? c.option : undefined;
    }).filter((o): o is SourceOption => !!o).sort((a, b) => a.date!.toMillis() - b.date!.toMillis());
    if (!buffVisits.length) { continue; }

    let question: WingBuffQuestion | undefined;
    for (const a of list) {
      const sourceDate = a.source.date ?? a.season?.date ?? ctx.startDate;
      const onVisit = a.source.role === 'visit' ? buffVisits.find(v => v.tree === a.source.tree) : undefined;
      const later = buffVisits.filter(v => v.tree !== a.source.tree && v.date! > sourceDate && v.date! >= ctx.startDate);
      if (!onVisit && !later.length) { continue; }
      const nodes = pathTo((onVisit ?? later[0]).node).filter(n => !nodeCovered(n));
      const q: WingBuffQuestion = { spirit, item: a.item, onVisit, later, nodes };
      if (onVisit) { question = q; break; }
      question ??= q;
    }
    if (question?.nodes.length) { questions.push(question); }
  }
  return questions;
}

function spiritTrees(spirit: ISpirit): Array<ISpiritTree> {
  return [
    spirit.tree,
    ...(spirit.treeRevisions ?? []),
    ...(spirit.travelingSpirits ?? []).map(t => t.tree),
    ...(spirit.specialVisitSpirits ?? []).map(v => v.tree)
  ].filter((t): t is ISpiritTree => !!t);
}

/* ---------- Trees ---------- */

function getCandidates(item: IItem): Array<Candidate> {
  const nodes = item.nodes?.length ? item.nodes : item.hiddenNodes ?? [];
  return nodes.map(n => { const tree = treeOf(n); return tree && classify(n, tree); }).filter((c): c is Candidate => !!c);
}

function classify(node: INode, tree: ISpiritTree): Candidate {
  const option = (role: SourceOption['role'], label: string, date?: DateTime, key = tree.guid): SourceOption => ({ key, role, label, date, tree, node });
  if (tree.travelingSpirit) {
    const date = tree.travelingSpirit.date;
    return { main: false, option: option('visit', `Traveling spirit, ${formatDate(date)}`, date) };
  }
  if (tree.specialVisitSpirit) {
    const date = tree.specialVisitSpirit.visit.date;
    return { main: false, option: option('visit', `Special visit, ${formatDate(date)}`, date) };
  }
  if (tree.eventInstanceSpirit) {
    const instance = tree.eventInstanceSpirit.eventInstance;
    const name = instance?.name ?? instance?.event?.name ?? 'Event';
    return { main: false, option: option('event', instance ? `${name}, ${formatDate(instance.date)}` : name, instance?.date) };
  }
  const spirit = tree.spirit;
  if (!spirit) { return { main: false, option: option('other', tree.name ?? 'Other') }; }
  const main = spirit.tree === tree;
  const revision = main ? undefined : (spirit.treeRevisions ?? []).find(t => t === tree) as IRevisedSpiritTree | undefined;
  if (spirit.season) {
    if (revision?.revisionType === 'AfterSeason') {
      return { main, option: option('after', 'After the season', spirit.season.endDate) };
    }
    return { main, option: option('season', spirit.season.name, spirit.season.date, 'season') };
  }
  return { main, option: option('regular', spirit.name) };
}

function treeOf(node: INode): ISpiritTree | undefined {
  return node.tree ?? node.root?.tree ?? NodeHelper.trace(node)[0]?.tree;
}

function spiritOf(tree?: ISpiritTree): ISpirit | undefined {
  return tree?.spirit ?? tree?.travelingSpirit?.spirit ?? tree?.specialVisitSpirit?.spirit ?? tree?.eventInstanceSpirit?.spirit;
}

/** Friendship tiers don't force earlier nodes, connected trees need every node up to the root. */
function pathTo(node: INode): Array<INode> {
  return treeOf(node)?.tier ? [node] : NodeHelper.trace(node);
}

function formatDate(date: DateTime): string {
  return date.toFormat('d LLL yyyy');
}

function distinct<T>(values: ReadonlyArray<T>): Array<T> {
  return [...new Set(values)];
}
