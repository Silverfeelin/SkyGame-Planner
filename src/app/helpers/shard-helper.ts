/**
 * The contents of this file are based on the original work by Plutoy (https://github.com/PlutoyDev).
 * Very slight modifications were made to be able to use the code in this project.
 * Sources:
 * - https://raw.githubusercontent.com/PlutoyDev/sky-shards/production/src/data/shard.ts
 * - https://github.com/PlutoyDev/sky-shards/blob/production/src/i18n/en.json
 * License:
 * - MIT License (https://github.com/PlutoyDev/sky-shards/blob/production/LICENSE)
 */

import { DateTime, Duration } from 'luxon';

// const earlySkyOffset = Duration.fromObject({ minutes: -32, seconds: -10 }); //after start
// const eruptionOffset = Duration.fromObject({ minutes: 7 }); //after start
const landOffset = Duration.fromObject({ minutes: 8, seconds: 40 }); //after start
const endOffset = Duration.fromObject({ hours: 4 }); //after start

const blackShardInterval = Duration.fromObject({ hours: 8 });
const redShardInterval = Duration.fromObject({ hours: 6 });

const realms = ['prairie', 'forest', 'valley', 'wasteland', 'vault'] as const;
type Areas = keyof Translation['skyMaps'];
type Translation = {
  skyMaps: {
    'prairie.butterfly': 'Butterfly Fields',
    'prairie.village': 'Village Islands',
    'prairie.cave': 'Cave',
    'prairie.bird': 'Bird Nest',
    'prairie.island': 'Sanctuary Island',
    'forest.brook': 'Brook',
    'forest.boneyard': 'Boneyard',
    'forest.end': 'Forest Garden',
    'forest.tree': 'Treehouse',
    'forest.sunny': 'Elevated Clearing',
    'valley.rink': 'Ice Rink',
    'valley.dreams': 'Village of Dreams',
    'valley.hermit': 'Hermit valley',
    'wasteland.temple': 'Broken Temple',
    'wasteland.battlefield': 'Battlefield',
    'wasteland.graveyard': 'Graveyard',
    'wasteland.crab': 'Crab Field',
    'wasteland.ark': 'Forgotten Ark',
    'vault.starlight': 'Starlight Desert',
    'vault.jelly': 'Jellyfish Cove',
  };
};

interface ShardConfig {
  noShardWkDay: number[];
  offset: Duration;
  interval: Duration;
  // maps: [string, string, string, string, string];
  maps: [Areas, Areas, Areas, Areas, Areas];
  defRewardAC?: number;
}

const shardsInfo = [
  {
    noShardWkDay: [6, 7], //Sat;Sun
    interval: blackShardInterval,
    offset: Duration.fromObject({
      hours: 1,
      minutes: 50,
    }),
    // maps: ['Butterfly Field', 'Forest Brook', 'Ice Rink', 'Broken Temple', 'Starlight Desert'],
    maps: ['prairie.butterfly', 'forest.brook', 'valley.rink', 'wasteland.temple', 'vault.starlight'],
  },
  {
    noShardWkDay: [7, 1], //Sun;Mon
    interval: blackShardInterval,
    offset: Duration.fromObject({
      hours: 2,
      minutes: 10,
    }),
    // maps: ['Village Islands', 'Boneyard', 'Ice Rink', 'Battlefield', 'Starlight Desert'],
    maps: ['prairie.village', 'forest.boneyard', 'valley.rink', 'wasteland.battlefield', 'vault.starlight'],
  },
  {
    noShardWkDay: [1, 2], //Mon;Tue
    interval: redShardInterval,
    offset: Duration.fromObject({
      hours: 7,
      minutes: 40,
    }),
    // maps: ['Cave', 'Forest Garden', 'Village of Dreams', 'Graveyard', 'Jellyfish Cove'],
    maps: ['prairie.cave', 'forest.end', 'valley.dreams', 'wasteland.graveyard', 'vault.jelly'],
    defRewardAC: 2,
  },
  {
    noShardWkDay: [2, 3], //Tue;Wed
    interval: redShardInterval,
    offset: Duration.fromObject({
      hours: 2,
      minutes: 20,
    }),
    // maps: ['Bird Nest', 'Treehouse', 'Village of Dreams', 'Crabfield', 'Jellyfish Cove'],
    maps: ['prairie.bird', 'forest.tree', 'valley.dreams', 'wasteland.crab', 'vault.jelly'],
    defRewardAC: 2.5,
  },
  {
    noShardWkDay: [3, 4], //Wed;Thu
    interval: redShardInterval,
    offset: Duration.fromObject({
      hours: 3,
      minutes: 30,
    }),
    // maps: ['Sanctuary Island', 'Elevated Clearing', 'Hermit valley', 'Forgotten Ark', 'Jellyfish Cove'],
    maps: ['prairie.island', 'forest.sunny', 'valley.hermit', 'wasteland.ark', 'vault.jelly'],
    defRewardAC: 3.5,
  },
] satisfies ShardConfig[];

const overrideRewardAC: Record<string, number> = {
  // 'Forest Garden': 2.5,
  'forest.end': 2.5,
  // 'Village of Dreams': 2.5,
  'valley.dreams': 2.5,
  // 'Treehouse': 3.5,
  'forest.tree': 3.5,
  // 'Jellyfish Cove': 3.5,
  'vault.jelly': 3.5,
};

// Used to validate variation input, not listed = 1
export const numMapVarients = {
  'prairie.butterfly': 3,
  'prairie.village': 3,
  'prairie.bird': 2,
  'prairie.island': 3,
  'forest.brook': 2,
  'forest.end': 2,
  'valley.rink': 3,
  'valley.dreams': 2,
  'wasteland.temple': 3,
  'wasteland.battlefield': 3,
  'wasteland.graveyard': 2,
  'wasteland.crab': 2,
  'wasteland.ark': 4,
  'vault.starlight': 3,
  'vault.jelly': 2,
};

export function getShardInfo(date: DateTime) {
  const today = date.setZone('America/Los_Angeles').startOf('day');
  const [dayOfMth, dayOfWk] = [today.day, today.weekday];
  const isRed = dayOfMth % 2 === 1;
  const realmIdx = (dayOfMth - 1) % 5;
  const infoIndex = (dayOfMth % 2 === 1 ? (((dayOfMth - 1) / 2) % 3) + 2 : (dayOfMth / 2) % 2);
  const { noShardWkDay, interval, offset, maps, defRewardAC } = shardsInfo[infoIndex];
  const hasShard = !noShardWkDay.includes(dayOfWk);
  const map = maps[realmIdx];
  const rewardAC = isRed ? overrideRewardAC[map] ?? defRewardAC : undefined;
  const numVarient = numMapVarients[map as keyof typeof numMapVarients] ?? 1;
  let firstStart = today.plus(offset);
  //Detect timezone changed, happens on Sunday, shardInfoIdx is 2,3 or 4. Offset > 2hrs
  if (dayOfWk === 7 && today.isInDST !== firstStart.isInDST) {
    firstStart = firstStart.plus({ hours: firstStart.isInDST ? -1 : 1 });
  }
  const occurrences = Array.from({ length: 3 }, (_, i) => {
    const start = firstStart.plus(interval.mapUnits(x => x * i));
    const land = start.plus(landOffset);
    const end = start.plus(endOffset);
    return { start, land, end };
  });
  return {
    date,
    isRed,
    hasShard,
    offset,
    interval,
    lastEnd: occurrences[2].end,
    realm: realms[realmIdx],
    map,
    numVarient,
    rewardAC,
    occurrences
  };
}

export type ShardInfo = ReturnType<typeof getShardInfo>;

interface findShardOptions {
  only?: undefined | 'black' | 'red';
}

export function findNextShard(from: DateTime, opts: findShardOptions = {}): ShardInfo {
  const info = getShardInfo(from);
  const { hasShard, isRed, lastEnd } = info;
  const { only } = opts;
  if (hasShard && from < lastEnd && (!only || (only === 'red') === isRed)) {
    return info;
  } else {
    return findNextShard(from.plus({ days: 1 }), { only });
  }
}
