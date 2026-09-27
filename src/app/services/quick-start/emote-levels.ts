import { IItem, INode, ISpiritTree } from 'skygame-data';
import { NodeHelper } from '@app/helpers/node-helper';
import { EmoteEntry, EmoteLevelState, EmoteSolution } from './quick-start.model';

interface EmoteStructure {
  tiered: boolean;
  /** Per level (index 0 is level 1): levels that must be unlocked first. */
  prereqs: Array<Array<number>>;
  /** Per level: items further down a tree, which can't be owned without the level. */
  below: Array<Array<IItem>>;
}

/** Used when a level has no node to read the order from. */
const STANDARD_PREREQS: Record<number, Array<number>> = { 2: [1], 3: [1], 4: [1, 3] };

const structures = new WeakMap<IItem, EmoteStructure>();

/**
 * Works out which levels of an emote are owned. The dots count owned levels, but levels can be skipped,
 * so candidate sets must have exactly `dots` levels, include level 1 and every known level, and respect the tree order.
 * Levels that are the same in every candidate set are settled.
 */
export function solveEmote(entry: EmoteEntry, owned: ReadonlySet<string>): EmoteSolution {
  const m = entry.levels.length;
  const s = getStructure(entry.levels);
  const levels: Array<EmoteLevelState> = entry.levels.map((item, i) => ({ level: i + 1, item, on: false, known: false, why: '' }));
  const set = (l: number, on: boolean, why: string): boolean => {
    const v = levels[l - 1];
    if (!v || v.known) { return false; }
    v.on = on; v.known = true; v.why = why;
    return true;
  };

  entry.locked.forEach(l => set(l, true, 'Already unlocked'));
  entry.picked.forEach((on, l) => set(l, on, on ? 'You picked this' : 'You marked this as not owned'));
  s.below.forEach((items, i) => {
    const hit = items.find(item => owned.has(item.guid));
    if (hit) { set(i + 1, true, `Needed for ${hit.name}`); }
  });

  let changed = true;
  while (changed) {
    changed = false;
    levels.forEach((v, i) => {
      if (!v.on) { return; }
      s.prereqs[i].forEach(k => { changed = set(k, true, `Needed for level ${i + 1}`) || changed; });
    });
  }

  if (entry.dots === null || entry.unclear) {
    levels.forEach(v => { v.known = true; });
    return { levels, resolved: true, need: 0, conflict: false, tiered: s.tiered };
  }

  const dots = entry.dots;
  const fits: Array<number> = [];
  for (let mask = 0; mask < 1 << m; mask++) {
    const has = (l: number) => !!(mask & (1 << (l - 1)));
    let count = 0;
    for (let l = 1; l <= m; l++) { if (has(l)) { count++; } }
    if (count !== dots) { continue; }
    if (dots > 0 && !has(1)) { continue; }
    if (levels.some(v => v.known && v.on !== has(v.level))) { continue; }
    if (levels.some(v => has(v.level) && s.prereqs[v.level - 1].some(k => !has(k)))) { continue; }
    fits.push(mask);
  }
  if (!fits.length) { return { levels, resolved: false, need: 0, conflict: true, tiered: s.tiered }; }

  levels.forEach(v => {
    if (v.known) { return; }
    const bit = 1 << (v.level - 1);
    if (fits.every(f => f & bit)) {
      set(v.level, true, v.level === 1 ? 'Level 1 always comes first' : dots === m ? `All ${m} levels (${dots} dots)` : 'The only way to fit the dots');
    } else if (fits.every(f => !(f & bit))) {
      set(v.level, false, 'Not one of the dots');
    }
  });
  const need = dots - levels.filter(v => v.on).length;
  return { levels, resolved: fits.length === 1, need, conflict: false, tiered: s.tiered };
}

function getStructure(levels: Array<IItem>): EmoteStructure {
  const cached = levels[0] && structures.get(levels[0]);
  if (cached && cached.prereqs.length === levels.length) { return cached; }
  const s = buildStructure(levels);
  if (levels[0]) { structures.set(levels[0], s); }
  return s;
}

function buildStructure(levels: Array<IItem>): EmoteStructure {
  const levelOf = new Map<string, number>(levels.map((item, i) => [item.guid, i + 1]));
  const nodesOf = (item: IItem) => item.nodes?.length ? item.nodes : item.hiddenNodes ?? [];
  const primary = primaryTree(levels, nodesOf);
  if (primary?.tier) {
    return { tiered: true, prereqs: levels.map(() => []), below: levels.map(() => []) };
  }

  const prereqs = levels.map((item, i) => {
    const node = nodesOf(item).find(n => treeOf(n) === primary) ?? nodesOf(item).find(n => !treeOf(n)?.tier);
    if (!node) { return STANDARD_PREREQS[i + 1] ?? []; }
    const found = NodeHelper.trace(node).slice(0, -1)
      .map(n => n.item && levelOf.get(n.item.guid))
      .filter((l): l is number => !!l && l !== i + 1);
    return [...new Set(found)].sort((a, b) => a - b);
  });

  // Visit trees mirror the original tree, but revised trees may not, so those don't force a level.
  const below = levels.map(item => {
    const items = new Set<IItem>();
    for (const node of nodesOf(item)) {
      const tree = treeOf(node);
      if (!tree || tree.tier || tree.spirit?.treeRevisions?.some(t => t === tree)) { continue; }
      NodeHelper.all(node).slice(1).forEach(n => {
        if (n.item && !levelOf.has(n.item.guid)) { items.add(n.item); }
      });
    }
    return [...items];
  });

  return { tiered: false, prereqs, below };
}

/** The spirit's own tree (permanent or season tree), else the tree of the first level node. */
function primaryTree(levels: Array<IItem>, nodesOf: (item: IItem) => Array<INode>): ISpiritTree | undefined {
  for (const item of levels) {
    for (const node of nodesOf(item)) {
      const tree = treeOf(node);
      if (tree?.spirit && tree.spirit.tree === tree) { return tree; }
    }
  }
  const first = levels.map(l => nodesOf(l)[0]).find(n => n);
  return first && treeOf(first);
}

function treeOf(node: INode): ISpiritTree | undefined {
  return node.tree ?? node.root?.tree ?? NodeHelper.trace(node)[0]?.tree;
}
