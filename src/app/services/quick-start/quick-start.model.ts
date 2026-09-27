import { IItem, INode, IRealm, ISeason, ISpirit, ISpiritTree, ItemType } from 'skygame-data';
import { DateTime } from 'luxon';

export type QuickStartTabKind = 'closet' | 'emote' | 'stanceCall' | 'music';

export interface QuickStartTab {
  key: string;
  label: string;
  kind: QuickStartTabKind;
  /** Item types listed in the tab, in closet order. */
  types: Array<ItemType>;
}

export const QUICK_START_TABS: ReadonlyArray<QuickStartTab> = [
  { key: 'Outfit', label: 'Outfits', kind: 'closet', types: [ItemType.Outfit] },
  { key: 'Shoes', label: 'Shoes', kind: 'closet', types: [ItemType.Shoes] },
  { key: 'OutfitShoes', label: 'Outfits with shoes', kind: 'closet', types: [ItemType.OutfitShoes] },
  { key: 'Mask', label: 'Masks', kind: 'closet', types: [ItemType.Mask] },
  { key: 'FaceAccessory', label: 'Face accessories', kind: 'closet', types: [ItemType.FaceAccessory] },
  { key: 'Necklace', label: 'Necklaces', kind: 'closet', types: [ItemType.Necklace] },
  { key: 'Hair', label: 'Hair', kind: 'closet', types: [ItemType.Hair] },
  { key: 'HairAccessory', label: 'Hair accessories', kind: 'closet', types: [ItemType.HairAccessory] },
  { key: 'HeadAccessory', label: 'Head accessories', kind: 'closet', types: [ItemType.HeadAccessory] },
  { key: 'Cape', label: 'Capes', kind: 'closet', types: [ItemType.Cape] },
  { key: 'Held', label: 'Held props', kind: 'closet', types: [ItemType.Held] },
  { key: 'Furniture', label: 'Furniture', kind: 'closet', types: [ItemType.Furniture] },
  { key: 'Prop', label: 'Placeable props', kind: 'closet', types: [ItemType.Prop] },
  { key: 'Emote', label: 'Emotes', kind: 'emote', types: [ItemType.Emote] },
  { key: 'StanceCall', label: 'Stances and calls', kind: 'stanceCall', types: [ItemType.Stance, ItemType.Call] },
  { key: 'Music', label: 'Music sheets', kind: 'music', types: [ItemType.Music] }
];

/** owned: accent ring + tick; unsure: orange "!" or "?"; no: not owned; lock: unlocked before quick start. */
export type TileState = 'owned' | 'unsure' | 'no' | 'lock';

/** match: low confidence match ("!"); unlock: matched, but it may only be a preview of a locked item ("?"). */
export type UnsureReason = 'match' | 'unlock';

export interface QuickStartTile {
  item: IItem;
  state: TileState;
  /** Why an unsure tile needs a look. */
  reason?: UnsureReason;
  /** Set once the user tapped an unsure tile; later taps switch between owned and no. */
  touched?: boolean;
}

export interface QuickStartAsk {
  shot: number;
  cell: [number, number];
  candidates: Array<IItem>;
  /** undefined: unanswered; null: none of these. */
  pick?: IItem | null;
  /** Object URL of the tile cropped from the screenshot. */
  crop?: string;
}

/* ---------- Emote levels ---------- */

export interface EmoteEntry {
  /** Level items of one emote; index 0 is level 1. */
  levels: Array<IItem>;
  /** Owned level count read from the screenshot. null in manual mode or when not imported. */
  dots: number | null;
  /** The dots couldn't be read: every level is asked. */
  unclear: boolean;
  /** Levels unlocked before quick start (1-based). */
  locked: ReadonlySet<number>;
  /** Levels the user toggled (1-based level → owned). */
  picked: ReadonlyMap<number, boolean>;
}

export interface EmoteLevelState {
  level: number;
  item: IItem;
  on: boolean;
  /** Settled by a rule or the user; false means it might be one of the dots. */
  known: boolean;
  /** Tooltip, e.g. "Needed for Pouty Porter Cape", "Level 1 always comes first". */
  why: string;
}

export interface EmoteSolution {
  levels: Array<EmoteLevelState>;
  /** Exactly one candidate set remains (or no dot count to satisfy). */
  resolved: boolean;
  /** Levels still to pick when unresolved. */
  need: number;
  /** No set of levels fits the dots. */
  conflict: boolean;
  /** Tiered tree: levels have no order. */
  tiered: boolean;
}

/* ---------- Inference ---------- */

export type SourceKind = 'season' | 'travelingSpirit' | 'specialVisit' | 'regular' | 'event' | 'other';

/** A tree an owned item may have come from. */
export interface SourceOption {
  /** 'season' for a season spirit's own tree, otherwise the tree GUID. */
  key: string;
  kind: SourceKind;
  label: string;
  date?: DateTime;
  tree: ISpiritTree;
  node: INode;
}

export interface Attribution {
  item: IItem;
  spirit?: ISpirit;
  season?: ISeason;
  source: SourceOption;
  options: Array<SourceOption>;
  reason: string;
  /** Doesn't fit the start date; the player should check it. */
  warn: boolean;
  overridden: boolean;
}

export interface WingBuffQuestion {
  spirit: ISpirit;
  item: IItem;
  /** Visit the item was attributed to, when that visit's tree had a wing buff. */
  onVisit?: SourceOption;
  /** Later visits on/after the start with a wing buff. */
  later: Array<SourceOption>;
  /** Wing buff node to unlock when answered yes, plus its prerequisites. */
  nodes: Array<INode>;
}

export interface OnTheWay {
  spirit?: ISpirit;
  tree: ISpiritTree;
  /** Prerequisite nodes that weren't unlocked or owned. */
  nodes: Array<INode>;
  /** The furthest owned item that required them. */
  before: IItem;
}

export interface SeasonSummary {
  season: ISeason;
  pass: boolean;
  items: number;
  ultimates: number;
}

export interface QuickStartInput {
  /** Newly confirmed owned items from every tab, including emote level items. */
  owned: ReadonlyArray<IItem>;
  /** GUIDs unlocked before quick start. They count as evidence but are never re-saved. */
  unlocked: ReadonlySet<string>;
  /** Chosen start season; undefined when the player is unsure. */
  start?: ISeason;
  /** The Necklace tab was confirmed, so a missing pendant means no season pass. */
  necklaceCovered: boolean;
  /** Realms where the player collected all winged light. */
  wingedLightRealms: ReadonlyArray<IRealm>;
  /** Item GUID → SourceOption.key. */
  sourceOverride: ReadonlyMap<string, string>;
  /** Spirit GUIDs whose wing buff question was answered yes. */
  wingBuffs: ReadonlySet<string>;
  /** Player chose "Keep my start" on the conflict banner. */
  conflictHandled: boolean;
}

export interface QuickStartPlan {
  start: ISeason;
  /** Start was worked out from the closet. */
  derivedStart: boolean;
  /** Earliest season-only evidence before the chosen start. */
  conflict?: { item: IItem, season: ISeason };
  seasons: Array<SeasonSummary>;
  /** Owned season items (and music sheets) with their source; the review lists those not from the season or with `warn`. */
  attributions: Array<Attribution>;
  wingBuffQuestions: Array<WingBuffQuestion>;
  onTheWay: Array<OnTheWay>;
  /** Everything to pass to one `addUnlocked` call: item, hidden item and node GUIDs. Excludes already unlocked GUIDs. */
  unlock: Array<string>;
  /** Season GUIDs for `addSeasonPasses`. */
  seasonPasses: Array<string>;
  /** Winged light GUIDs for `addWingedLights`. */
  wingedLights: Array<string>;
  counts: { items: number, nodes: number, seasonPasses: number, wingedLights: number, wingBuffs: number };
}
