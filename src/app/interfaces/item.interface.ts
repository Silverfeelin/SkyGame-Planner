import { IConfig, IGuid } from './base.interface';
import { IIAP } from './iap.interface';
import { INode } from './node.interface';
import { ISeason } from './season.interface';
import { IWiki } from './wiki.interface';

export interface IItemConfig extends IConfig<IItem> {}

export interface IItem extends IGuid {
  /** Item type. */
  type: ItemType;
  /** Item group. */
  group?: ItemGroup;
  /** Item name. */
  name: string;
  /** Path to item icon. */
  icon?: string;
  /** Path to preview image. */
  previewUrl?: string;
  /** Item order (within category). */
  order?: number;

  /** Emote level. */
  level?: number;

  /// References ///

  /** Spirit tree nodes that unlock this item. */
  nodes?: Array<INode>;
  /** Spirit tree nodes that unlock this item without showing the item. Generally ones added retroactively. */
  hiddenNodes?: Array<INode>;
  /** IAPs that unlock this item. */
  iaps?: Array<IIAP>;
  /** Season the item was introduced in. */
  season?: ISeason;

  /// Progress ///
  unlocked?: boolean;

  _wiki?: IWiki;
}

export enum ItemType {
  /** All cosmetics in the hat category. */
  Hat = 'Hat',
  /** All cosmetics in the hair category. */
  Hair = 'Hair',
  /** All cosmetics in the mask category. */
  Mask = 'Mask',
  /** All cosmetics in the face accessory category. */
  FaceAccessory = 'FaceAccessory',
  /** All cosmetics in the nacklace category.*/
  Necklace = 'Necklace',
  /** All cosmetics in the pants category. */
  Outfit = 'Outfit',
  /** All cosmetics in the shoes category. */
  Shoes = 'Shoes',
  /** All cosmetics in the cape category. */
  Cape = 'Cape',
  /** All musical instruments in the held category. */
  Instrument = 'Instrument',
  /** All non-instrument items in the held category. */
  Held = 'Held',
  /** All items in the chair category. */
  Prop = 'Prop',
  /** All emotes. */
  Emote = 'Emote',
  /** All stances. */
  Stance = 'Stance',
  /** All honks. */
  Call = 'Call',
  /** All spells in the spell tab. */
  Spell = 'Spell',
  /** All music sheets. */
  Music = 'Music',
  /** All quests. */
  Quest = 'Quest',
  /** All wing buffs */
  WingBuff = 'WingBuff',
  /** Other special (non-)items such as candle blessings. */
  Special = 'Special'
}

export type ItemGroup = 'Elder' | 'Season' | 'SeasonPass' | 'Ultimate';
