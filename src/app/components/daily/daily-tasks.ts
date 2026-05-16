import { DateHelper } from '@app/helpers/date-helper';
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
  { id: 'treasure-reef-clams', name: 'Treasure Reef Clams', cadence: 'daily-variable', location: 'Treasure Reef', externalLink: 'https://sky-children-of-the-light.fandom.com/wiki/Additional_Light_Sources#Treasure_Reef', lightRange: [159, 245] },
  { id: 'village-theater-bouquets', name: 'Village Theater Bouquets', cadence: 'daily-variable', location: 'Village Theatre', lightRange: [21, 44] },
  { id: 'yeti-race', name: 'Yeti Race', cadence: 'daily-variable', location: 'Hermit Valley', note: 'Fragments increase light', lightRange: [150, 300] },
  { id: 'shards', name: 'Black shard eruptions', cadence: 'daily-variable', note: 'Location and time varies', externalLink: 'https://sky-shards.pages.dev/en', light: 200 },

  // Timed
  { id: 'geyser', name: 'Polluted Geyser', cadence: 'timed', nextFn: nextGeyser, location: 'Sanctuary Island', light: 1000 },
  { id: 'grandma', name: "Grandma's Dinner", cadence: 'timed', nextFn: nextGrandma, location: 'Elevated Clearing', light: 1000 },
  { id: 'sanctuary-turtle-event', name: 'Sanctuary Turtle', cadence: 'timed', nextFn: nextTurtle, location: 'Sanctuary Island', note: 'Includes random clams', lightRange: [310, 488] },
  { id: 'dreams-skater', name: 'Dreams Skater', cadence: 'timed', nextFn: nextSkater, location: 'Village of Dreams', note: 'Only Friday to Sunday', light: 400 },

  // Weekly — Eye of Eden
  { id: 'eden-run', name: 'Eye of Eden run', cadence: 'weekly', link: '/realm/pnr-tracker' },
];

function nextEvenTime(offsetMinutes: number): DateTime {
  const now = DateTime.now().setZone(DateHelper.skyTimeZone);
  let candidate = now.startOf('hour');
  if (candidate.hour % 2 == 1) { candidate = candidate.plus({ hours: 1 }); }
  candidate = candidate.plus({ minutes: offsetMinutes });
  if (candidate <= now) { candidate = candidate.plus({ hours: 2 }); }
  return candidate;
}

function nextGeyser(): DateTime {
  return nextEvenTime(5);
}

function nextGrandma(): DateTime {
  return nextEvenTime(35);
}

function nextTurtle(): DateTime {
  return nextEvenTime(50);
}

function nextSkater(): DateTime {
  const now = DateTime.now().setZone(DateHelper.skyTimeZone);
  const hour = now.hour;

  let candidate = now.startOf('hour').plus({ hours: hour % 2 === 0 ? 1 : 2 });
  return candidate.weekday >= 5
    ? candidate
    : candidate.plus({ days: 5 - candidate.weekday }).startOf('day').plus({ hours: 1 });
}
