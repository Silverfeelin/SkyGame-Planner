import { IItem, INode, ISpiritTree } from 'skygame-data';
import { NodeHelper } from '@app/helpers/node-helper';
import { EmoteEntry, EmoteLevelState, EmoteSolution } from './quick-start.model';

interface EmoteStructure {
  /** Per level (index 0 is level 1): levels that must be unlocked first. */
  prereqs: Array<Array<number>>;
  /** Per level: items further down a tree, which can't be owned without the level. */
  below: Array<Array<IItem>>;
}

/** Used when a level has no node to read the order from. */
const STANDARD_PREREQS: Record<number, Array<number>> = { 2: [1], 3: [1], 4: [1, 3] };

const structures = new WeakMap<IItem, EmoteStructure>();

/**
 * Works out which levels of an emote are owned from the levels the player picked or had unlocked, owned items further
 * down a tree, and the tree order. Levels can be skipped, so anything else stays off.
 */
export function solveEmote(entry: EmoteEntry, owned: ReadonlySet<string>): EmoteSolution {
  const s = getStructure(entry.levels);
  const levels: Array<EmoteLevelState> = entry.levels.map((item, i) => ({ level: i + 1, item, on: false, why: '' }));
  const settled = new Set<number>();
  const set = (l: number, on: boolean, why: string): boolean => {
    const v = levels[l - 1];
    if (!v || settled.has(l)) { return false; }
    settled.add(l);
    v.on = on; v.why = why;
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

  return { levels };
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
    return { prereqs: levels.map(() => []), below: levels.map(() => []) };
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

  return { prereqs, below };
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
