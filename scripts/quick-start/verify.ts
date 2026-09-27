/**
 * Runs the quick start inference and emote level solver against the real game data and checks a set of scenarios.
 *
 * npm run quick-start-verify
 * Bundled with esbuild because skygame-data is ESM-only.
 */
import fs from 'fs';
import path from 'path';
import { IItem, INode, ISeason, ISpirit, ItemType, SkyDataResolver } from 'skygame-data';
import { NodeHelper } from '../../src/app/helpers/node-helper';
import { inferProgress, QuickStartData } from '../../src/app/services/quick-start/quick-start-inference';
import { solveEmote } from '../../src/app/services/quick-start/emote-levels';
import { EmoteEntry, QuickStartInput, QuickStartPlan } from '../../src/app/services/quick-start/quick-start.model';

const ROOT = process.cwd();
const text = fs.readFileSync(path.join(ROOT, 'node_modules/skygame-data/assets/everything.json'), 'utf8');
const sky = SkyDataResolver.resolve(SkyDataResolver.parse(text as any));
const data = { seasonConfig: sky.seasons, itemConfig: sky.items } as unknown as QuickStartData;

const items = sky.items.items as Array<IItem>;
const seasons = (sky.seasons.items as Array<ISeason>).slice().sort((a, b) => a.date.toMillis() - b.date.toMillis());
const spirits = sky.spirits.items as Array<ISpirit>;

let passed = 0;
let failed = 0;
const results: Array<string> = [];

function check(label: string, ok: boolean, detail?: string): void {
  if (ok) { passed++; results.push(`  ok    ${label}`); return; }
  failed++;
  results.push(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
}

function scenario(name: string, fn: () => void): void {
  results.push(name);
  try { fn(); } catch (e) { failed++; results.push(`  FAIL  threw: ${(e as Error).stack ?? e}`); }
}

function item(name: string, level?: number): IItem {
  const found = items.find(i => i.name === name && (level === undefined || (i.level ?? 1) === level));
  if (!found) { throw new Error(`Item not found: ${name}${level ? ` #${level}` : ''}`); }
  return found;
}

function spirit(name: string): ISpirit {
  const found = spirits.find(s => s.name === name);
  if (!found) { throw new Error(`Spirit not found: ${name}`); }
  return found;
}

function season(shortName: string): ISeason {
  const found = seasons.find(s => s.shortName === shortName);
  if (!found) { throw new Error(`Season not found: ${shortName}`); }
  return found;
}

function emoteLevels(name: string): Array<IItem> {
  return items.filter(i => i.type === ItemType.Emote && i.name === name).sort((a, b) => (a.level ?? 1) - (b.level ?? 1));
}

function run(partial: Partial<QuickStartInput>): QuickStartPlan {
  return inferProgress(data, {
    owned: [], unlocked: new Set(), start: seasons[0], necklaceCovered: false,
    sourceOverride: new Map(), wingBuffs: new Set(), conflictHandled: false, ...partial
  });
}

function entry(name: string, dots: number | null, picked: Array<[number, boolean]> = [], locked: Array<number> = []): EmoteEntry {
  return { levels: emoteLevels(name), dots, unclear: false, locked: new Set(locked), picked: new Map(picked) };
}

const onLevels = (sol: ReturnType<typeof solveEmote>) => sol.levels.filter(l => l.on).map(l => l.level).join(',');
const knownLevels = (sol: ReturnType<typeof solveEmote>) => sol.levels.filter(l => l.known).map(l => l.level).join(',');

/** Visits of an item's nodes, oldest first. */
function visitsOf(i: IItem): Array<{ date: ISeason['date'], node: INode }> {
  return (i.nodes ?? []).map(node => {
    const tree = node.tree ?? node.root?.tree;
    const date = tree?.travelingSpirit?.date ?? tree?.specialVisitSpirit?.visit.date;
    return date ? { date, node } : undefined;
  }).filter((v): v is { date: ISeason['date'], node: INode } => !!v).sort((a, b) => a.date.toMillis() - b.date.toMillis());
}

/* ---------- Scenarios ---------- */

scenario('Pendant owned: season pass and pass items from the season', () => {
  const pendant = item('Assembly Ultimate Pendant');
  const passItem = item('Baffled Botanist Hair');
  const plan = run({ owned: [pendant, passItem], necklaceCovered: true });
  check('season pass listed', plan.seasonPasses.includes(season('Assembly').guid), JSON.stringify(plan.seasonPasses));
  const a = plan.attributions.find(x => x.item === passItem);
  check('pass item attributed to the season', a?.source.key === 'season', `${a?.source.label} / ${a?.reason}`);
  check('reason mentions the pendant', !!a?.reason.includes('pendant'), a?.reason);
  check('season summary has pass', !!plan.seasons.find(s => s.season === season('Assembly'))?.pass);
  check('counts.seasonPasses', plan.counts.seasonPasses === 1);
});

scenario('Pass item without pendant, Necklace tab covered: first visit after the start', () => {
  const passItem = item('Baffled Botanist Hair');
  const visits = visitsOf(passItem).filter(v => v.date >= seasons[0].date);
  check('test item has visits', visits.length > 0);
  const plan = run({ owned: [passItem], necklaceCovered: true });
  const a = plan.attributions.find(x => x.item === passItem);
  check('attributed to the first visit', a?.source.node === visits[0]?.node, `${a?.source.label} / ${a?.reason}`);
  check('no season pass', plan.seasonPasses.length === 0);
  check('options list season plus every visit', a?.options.length === 1 + visitsOf(passItem).length, a?.options.map(o => o.label).join(' | '));

  const uncovered = run({ owned: [passItem], necklaceCovered: false });
  check('without the Necklace tab it stays with the season', uncovered.attributions[0]?.source.key === 'season', uncovered.attributions[0]?.reason);
});

scenario('Season item from before the start', () => {
  const mask = item('Baffled Botanist Mask');
  const start = season('Shattering');
  const visit = visitsOf(mask).find(v => v.date >= start.date);
  check('test item returned after the start', !!visit);
  const plan = run({ owned: [mask], start });
  const a = plan.attributions.find(x => x.item === mask);
  check('attributed to the first visit on or after the start', a?.source.node === visit?.node, `${a?.source.label} / ${a?.reason}`);
  check('not warned', a?.warn === false);

  const overridden = run({ owned: [mask], start, sourceOverride: new Map([[mask.guid, 'season']]) });
  const o = overridden.attributions[0];
  check('override to the season', o?.source.key === 'season' && o.overridden);

  const lastVisit = visitsOf(mask).at(-1)!;
  const late = seasons.find(s => s.date > lastVisit.date);
  if (late) {
    const none = run({ owned: [mask], start: late });
    check('no visit after the start: season with warn', none.attributions[0]?.source.key === 'season' && none.attributions[0].warn, none.attributions[0]?.reason);
  }

  const lastStart = seasons.filter(x => x.date.toMillis() <= Date.now()).at(-1)!;
  const neverReturned = items.find(i => i.season && i.season.date < lastStart.date && i.group !== 'Ultimate' && i.group !== 'SeasonPass'
    && ![ItemType.Special, ItemType.WingBuff, ItemType.Quest, ItemType.Spell].includes(i.type)
    && i.nodes?.length && !visitsOf(i).length && !i.listNodes?.length
    && i.nodes.every(n => { const t = n.tree ?? n.root?.tree; return t?.spirit?.tree === t && t?.spirit?.type === 'Season'; }));
  check('found an item that never returned', !!neverReturned);
  if (neverReturned) {
    const plan2 = run({ owned: [neverReturned], start: lastStart });
    const a2 = plan2.attributions[0];
    check(`never returned (${neverReturned.name}): season with warn`, a2?.source.key === 'season' && a2.warn, a2?.reason);
    check('and it is a start conflict', plan2.conflict?.item === neverReturned);
  }
});

scenario('Ultimate gift before the start', () => {
  const ultimate = item('Assembly Ultimate Cape');
  const start = season('Shattering');
  const plan = run({ owned: [ultimate], start });
  check('conflict with Assembly', plan.conflict?.season === season('Assembly'), plan.conflict?.season.name);
  check('ultimate stays with the season', plan.attributions[0]?.source.key === 'season');
  check('summary counts the ultimate', plan.seasons.find(s => s.season === season('Assembly'))?.ultimates === 1);
  check('conflict suppressed when handled', run({ owned: [ultimate], start, conflictHandled: true }).conflict === undefined);

  const unsure = run({ owned: [ultimate, item('Shattering Ultimate Pendant')], start: undefined });
  check('unsure start: derived from the earliest evidence', unsure.start === season('Assembly') && unsure.derivedStart, unsure.start.name);
  check('unsure start: no conflict', unsure.conflict === undefined);

  const nothing = run({ owned: [], start: undefined });
  check('nothing to derive from: latest started season', nothing.start === seasons.filter(s => s.date.toMillis() <= Date.now()).at(-1) && !nothing.derivedStart, nothing.start.name);
});

scenario('Regular spirit item deep in the tree: Pouty Porter Cape', () => {
  const cape = item('Pouty Porter Cape');
  const pouty = spirit('Pouty Porter');
  const plan = run({ owned: [cape] });
  const trace = NodeHelper.trace(cape.nodes!.find(n => n.root?.tree === pouty.tree || n.tree === pouty.tree));
  check('every node up to the root', trace.every(n => plan.unlock.includes(n.guid)), `${trace.length} nodes`);
  check('Angry 1 and 3 unlocked', plan.unlock.includes(item('Angry', 1).guid) && plan.unlock.includes(item('Angry', 3).guid));
  check('Angry 2 and 4 not unlocked', !plan.unlock.includes(item('Angry', 2).guid) && !plan.unlock.includes(item('Angry', 4).guid));
  check('Pouty Porter Hair not unlocked', !plan.unlock.includes(item('Pouty Porter Hair').guid));
  const way = plan.onTheWay.find(w => w.tree === pouty.tree);
  check('on the way lists the prerequisites', way?.nodes.length === trace.length - 1 && way.before === cape, way?.nodes.map(n => n.item?.name).join(', '));
  check('no attribution for a regular spirit item', plan.attributions.length === 0);
  check('counts', plan.counts.items === 1 && plan.counts.nodes === trace.length, JSON.stringify(plan.counts));
  check('no duplicates', new Set(plan.unlock).size === plan.unlock.length);
});

scenario('Already unlocked GUIDs never appear in unlock', () => {
  const cape = item('Pouty Porter Cape');
  const trace = NodeHelper.trace(cape.nodes![0]);
  const unlocked = new Set([trace[0].guid, trace[0].item!.guid, trace[2].guid]);
  const plan = run({ owned: [cape, item('Angry', 1)], unlocked });
  check('none of them in unlock', ![...unlocked].some(g => plan.unlock.includes(g)));
  check('the rest of the path is still unlocked', trace.slice(3).every(n => plan.unlock.includes(n.guid)));
  check('the unlocked emote is not counted as new', plan.counts.items === 1, JSON.stringify(plan.counts));
  const capeBefore = run({ owned: [cape], unlocked: new Set([cape.guid]) });
  check('an unlocked item is not re-saved', capeBefore.unlock.length === 0 && capeBefore.counts.items === 0);
});

scenario('Emote levels', () => {
  const two = solveEmote(entry('Angry', 2), new Set());
  check('2 dots: unresolved, need 1', !two.resolved && two.need === 1 && !two.conflict, `on ${onLevels(two)} need ${two.need}`);
  check('2 dots: 1 on, 4 off, 2 and 3 open', onLevels(two) === '1' && knownLevels(two) === '1,4', `known ${knownLevels(two)}`);
  check('2 dots: level 1 why', two.levels[0].why === 'Level 1 always comes first', two.levels[0].why);

  const all = solveEmote(entry('Angry', 4), new Set());
  check('4 dots: all levels', all.resolved && onLevels(all) === '1,2,3,4' && all.levels[3].why === 'All 4 levels (4 dots)', all.levels[3].why);

  const zero = solveEmote(entry('Angry', 0), new Set());
  check('0 dots: none', zero.resolved && onLevels(zero) === '', onLevels(zero));

  const byItem = solveEmote(entry('Angry', null), new Set([item('Pouty Porter Cape').guid]));
  check('owned item below level 3 forces 1 and 3', onLevels(byItem) === '1,3', onLevels(byItem));
  check('why: needed for the cape', byItem.levels[2].why === 'Needed for Pouty Porter Cape', byItem.levels.map(l => l.why).join(' | '));
  const byLevel = solveEmote(entry('Angry', null, [[3, true]]), new Set());
  check('why: needed for level 3', byLevel.levels[0].why === 'Needed for level 3', byLevel.levels[0].why);

  const byItemDots = solveEmote(entry('Angry', 3), new Set([item('Pouty Porter Cape').guid]));
  check('3 dots with the cape: {1,2,3} or {1,3,4}', !byItemDots.resolved && byItemDots.need === 1, `on ${onLevels(byItemDots)}`);

  const manual = solveEmote(entry('Angry', null, [[4, true]]), new Set());
  check('manual pick of 4 turns on 1 and 3', onLevels(manual) === '1,3,4' && manual.resolved, onLevels(manual));

  const locked = solveEmote(entry('Angry', 2, [], [3]), new Set());
  check('locked level 3 with 2 dots: {1,3}', locked.resolved && onLevels(locked) === '1,3' && locked.levels[2].why === 'Already unlocked');

  const miscount = solveEmote(entry('Angry', 1, [], [3]), new Set());
  check('1 dot with locked level 3: conflict', miscount.conflict && !miscount.resolved);

  const tieredName = 'Break Dance';
  const tiered = solveEmote({ ...entry(tieredName, null, [[4, true]]) }, new Set());
  check('tiered emote: no prerequisites', tiered.tiered && onLevels(tiered) === '4', onLevels(tiered));
  const tieredDots = solveEmote(entry(tieredName, 2), new Set());
  check('tiered emote, 2 dots: 1 plus any of 2..4', tieredDots.tiered && !tieredDots.resolved && tieredDots.need === 1 && onLevels(tieredDots) === '1');

  const wave = solveEmote(entry('Wave', 6), new Set());
  check('Wave has 6 levels, 6 dots: all', wave.levels.length === 6 && wave.resolved && onLevels(wave) === '1,2,3,4,5,6');
  const wave6 = solveEmote(entry('Wave', null, [[6, true]]), new Set());
  check('Wave: level 6 needs 1, 3 and 5', onLevels(wave6) === '1,3,5,6', onLevels(wave6));
  const wave3 = solveEmote(entry('Wave', 3), new Set());
  check('Wave, 3 dots: 1 and 3 settled, one of 2, 4, 5 open', !wave3.resolved && !wave3.conflict && wave3.need === 1 && onLevels(wave3) === '1,3' && knownLevels(wave3) === '1,3,6', `on ${onLevels(wave3)} known ${knownLevels(wave3)} need ${wave3.need}`);
});

scenario('Emote levels on an owned item\'s path follow its source', () => {
  const cape = item('Stretching Guru Cape');
  const yoga = [item('Yoga', 1), item('Yoga', 3)];
  const capeSeason = cape.season ?? spirit('Stretching Guru').season!;
  const start = seasons.find(s => s.date > capeSeason.date && visitsOf(cape).some(v => v.date >= s.date))!;
  const treeOfNode = (n: INode) => n.tree ?? n.root?.tree;
  const yogaNodesOn = (plan: QuickStartPlan) => yoga.flatMap(y => y.nodes ?? []).filter(n => plan.unlock.includes(n.guid)).map(treeOfNode);

  const plan = run({ owned: [...yoga, cape], start });
  const a = plan.attributions.find(x => x.item === cape);
  check('cape attributed to a visit', !!a && a.source.key !== 'season', a?.source.label);
  check('no attribution for Yoga', !plan.attributions.some(x => x.item.name === 'Yoga'), plan.attributions.map(x => x.item.name).join(', '));
  const trees = yogaNodesOn(plan);
  check('Yoga nodes only on the cape\'s tree', trees.length === 2 && trees.every(t => t === a?.source.tree), trees.map(t => t?.guid).join(', '));

  const overridden = run({ owned: [...yoga, cape], start, sourceOverride: new Map([[cape.guid, 'season']]) });
  const o = overridden.attributions.find(x => x.item === cape);
  const oTrees = yogaNodesOn(overridden);
  check('override moves the Yoga levels with the cape', o?.source.key === 'season' && oTrees.length === 2 && oTrees.every(t => t === o.source.tree), oTrees.map(t => t?.guid).join(', '));

  const alone = run({ owned: yoga, start });
  const aloneYoga = alone.attributions.filter(x => x.item.name === 'Yoga');
  const aloneTrees = yogaNodesOn(alone);
  check('Yoga picked alone: level 3 attributed, level 1 follows it', aloneYoga.length === 1 && aloneYoga[0].item === yoga[1]
    && aloneTrees.length === 2 && aloneTrees.every(t => t === aloneYoga[0].source.tree), aloneYoga.map(x => `${x.item.level} ${x.source.label}`).join(', '));
});

scenario('Pass item reason uses the full season name', () => {
  const passItem = items.find(i => i.group === 'SeasonPass' && i.season?.shortName === 'The Little Prince' && visitsOf(i).length)!;
  const plan = run({ owned: [passItem], necklaceCovered: true, start: passItem.season });
  const reason = plan.attributions[0]?.reason;
  check(`${passItem.name}: "${reason}"`, reason === `It's a season pass item and your closet has no pendant from ${passItem.season!.name}.`);
});

scenario('Wing buff from a later visit', () => {
  const mask = item('Baffled Botanist Mask');
  const botanist = spirit('Baffled Botanist');
  const plan = run({ owned: [mask] });
  const q = plan.wingBuffQuestions.find(x => x.spirit === botanist);
  check('question for Baffled Botanist', !!q && q.later.length > 0, plan.wingBuffQuestions.map(x => x.spirit.name).join(', '));
  check('question nodes end in the wing buff', q?.nodes.at(-1)?.item?.type === ItemType.WingBuff);
  check('not counted when unanswered', plan.counts.wingBuffs === 0 && !q?.nodes.some(n => plan.unlock.includes(n.guid)));

  const yes = run({ owned: [mask], wingBuffs: new Set([botanist.guid]) });
  check('yes adds the nodes', !!q && q.nodes.every(n => yes.unlock.includes(n.guid)) && yes.counts.wingBuffs === 1);
  check('yes adds the wing buff item', yes.unlock.includes(q!.nodes.at(-1)!.item!.guid));

  const wingBuff = q!.nodes.at(-1)!.item!;
  const already = run({ owned: [mask], unlocked: new Set([wingBuff.guid]) });
  check('no question once the wing buff is unlocked', !already.wingBuffQuestions.some(x => x.spirit === botanist));

  const late = run({ owned: [mask], start: seasons.at(-1) });
  const lateQ = late.wingBuffQuestions.find(x => x.spirit === botanist);
  check('visits before the start are not offered', !lateQ || lateQ.later.every(v => v.date! >= seasons.at(-1)!.date));
});

scenario('Every item and emote', () => {
  const closet = items.filter(i => ![ItemType.Special, ItemType.WingBuff, ItemType.Quest, ItemType.Spell].includes(i.type) && !i.autoUnlocked);
  const t0 = performance.now();
  const plan = run({ owned: closet, start: undefined, necklaceCovered: true });
  const ms = performance.now() - t0;
  check(`${closet.length} items infer in ${ms.toFixed(0)} ms`, ms < 1000 && plan.counts.items === closet.length);
  check('unlock has no duplicates', new Set(plan.unlock).size === plan.unlock.length);
  check('derived start is the first season', plan.start === seasons[0] && plan.derivedStart, plan.start.name);

  const names = new Set(items.filter(i => i.type === ItemType.Emote && i.subtype !== 'FriendEmote').map(i => i.name));
  const t1 = performance.now();
  const failures = [...names].filter(name => {
    const levels = emoteLevels(name);
    const sol = solveEmote(entry(name, levels.length), new Set());
    return !sol.resolved || sol.levels.some(l => !l.on);
  });
  check(`${names.size} emotes with every dot resolve to all levels (${(performance.now() - t1).toFixed(0)} ms)`, !failures.length, failures.join(', '));
});

console.log(results.join('\n'));
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) { process.exit(1); }
