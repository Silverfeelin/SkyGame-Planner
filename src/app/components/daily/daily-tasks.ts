import { DateTime } from 'luxon';

export type DailyCadence = 'daily' | 'daily-variable' | 'timed' | 'weekly';

export interface IDailyTask {
  id: string;
  name: string;
  cadence: DailyCadence;
  /** For timed tasks, the function to get the next occurrence. */
  nextFn?: () => DateTime;
  /** Next task time (see nextFn). */
  nextTime?: DateTime;
  /** Location name */
  location?: string;
  /** Fixed reward in pieces of light. Omitted for variable rewards. */
  light?: number;
  /** Range "min-max" for variable rewards. */
  lightRange?: [number, number];
  /** Internal routerLink, e.g. '/realm/cr-tracker'. */
  link?: string;
  /** External reference (wiki). */
  externalLink?: string;
  /** Short hint shown next to the task. */
  note?: string;
  noteFn?: () => string;
}

export const DAILY_TASKS: ReadonlyArray<IDailyTask> = [
  // Daily, fixed reward
  { id: 'daily-candles', name: 'Daily Candles', cadence: 'daily', note: 'Candle runs', link: '/realm/cr-tracker' },
  { id: 'cozy-hideout', name: 'Cozy Hideout', cadence: 'daily', location: 'Prairie Caves', light: 250 },
  { id: 'forest-campfire', name: 'Forest Campfire', cadence: 'daily', location: 'Forest Brook', light: 250 },
  { id: 'valley-campfire', name: 'Valley Campfire', cadence: 'daily', location: 'Temple of the Valley', light: 250 },
  { id: 'wasteland-campfire', name: 'Wasteland Campfire', cadence: 'daily', location: 'The Graveyard', light: 250 },
  { id: 'reef-eel', name: 'Reef Eel', cadence: 'daily', location: 'Treasure Reef', light: 500 },
  { id: 'passage-reliance', name: 'Passage of Reliance', cadence: 'daily', location: 'Forest Brook', light: 112 },
  { id: 'passage-assistance', name: 'Passage of Assistance', cadence: 'daily', location: 'Prairie Caves', light: 180 },
  { id: 'passage-coordination', name: 'Passage of Coordination', cadence: 'daily', location: 'Butterfly Fields', light: 128 },
  { id: 'passage-alignment', name: 'Passage of Alignment', cadence: 'daily', location: 'Boneyard', light: 200 },
  { id: 'cloud-tunnel', name: 'Cloud Tunnel', cadence: 'daily', location: 'Wind Paths', light: 250 },

  // Daily, variable reward
  // { id: 'sanctuary-clams', name: 'Sunset Sanctuary Clams', cadence: 'daily-variable', location: 'Daylight Prairie', lightRange: [159, 337] },
  { id: 'treasure-reef-clams', name: 'Treasure Reef Clams', cadence: 'daily-variable', location: 'Treasure Reef', externalLink: 'https://sky-children-of-the-light.fandom.com/wiki/Additional_Light_Sources#Treasure_Reef', lightRange: [159, 245] },
  { id: 'village-theater-bouquets', name: 'Village Theater Bouquets', cadence: 'daily-variable', location: 'Village Theatre', lightRange: [21, 44] },
  { id: 'yeti-race', name: 'Yeti Race', cadence: 'daily-variable', location: 'Hermit Valley', note: 'Fragments increase light', lightRange: [150, 300] },
  { id: 'shards', name: 'Black shard eruptions', cadence: 'daily-variable', note: 'Location and time varies', externalLink: 'https://sky-shards.pages.dev/en', light: 200 },

  // Timed
  { id: 'geyser', name: 'Polluted Geyser', cadence: 'timed', nextFn: nextGeyser, location: 'Sanctuary Island', light: 1000, note: 'XX:05 Sky time' },
  { id: 'grandma', name: "Grandma's Dinner", cadence: 'timed', nextFn: nextGrandma, location: 'Elevated Clearing', light: 1000, note: 'XX:35 Sky time' },
  { id: 'sanctuary-turtle-event', name: 'Sanctuary Turtle', cadence: 'timed', nextFn: nextTurtle, location: 'Daylight Prairie', note: 'Includes random clams', lightRange: [310, 488] },
  { id: 'dreams-skater', name: 'Dreams Skater', cadence: 'timed', nextFn: nextSkater, location: 'Village of Dreams', light: 400 },

  // Weekly — Eye of Eden
  { id: 'eden-run', name: 'Eye of Eden run', cadence: 'weekly', link: '/realm/pnr-tracker' },
];

function nextGeyser(): DateTime {
  // TODO: Get the first next "5 past even hour" in DateHelper.skyTimeZone.
  return DateTime.now().plus({ hour: 1 });
}

function nextGrandma(): DateTime {
  // TODO: Get the first next "35 past even hour" in DateHelper.skyTimeZone.
  return DateTime.now().plus({ hour: 1 });;
}

function nextTurtle(): DateTime {
  // TODO: Get the first next "50 past even hour" in DateHelper.skyTimeZone.
  return DateTime.now().plus({ hour: 1 });
}

function nextSkater(): DateTime {
  // TODO: Get the first next "uneven hour" in DateHelper.skyTimeZone, limited to Fri-Sun.
  return DateTime.now().plus({ hour: 1 });
}
