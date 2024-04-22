import { DateTime } from 'luxon';
import { Observable, Subject } from 'rxjs';

export interface IStorageEvent {
  type: 'save_start' | 'save_success' | 'save_error';
  error?: Error;
}

export interface IStorageProvider {
  _lastDate: DateTime;
  _syncDate: DateTime;
  _unlocked: Set<string>;
  _favourites: Set<string>;

  events: Subject<IStorageEvent>;

  load(): Observable<void>;
  save(): Observable<void>;
  getSyncDate(): DateTime;
  isOutOfSync(): boolean;

  getUnlocked(): ReadonlySet<string>;
  addUnlocked(guid: string): void;
  removeUnlocked(guid: string): void;
  isUnlocked(guid: string): boolean;

  getWingedLights(): ReadonlySet<string>;
  addWingedLights(guid: string): void;
  removeWingedLights(guid: string): void;
  hasWingedLight(guid: string): boolean;

  getFavourites(): ReadonlySet<string>;
  addFavourites(guid: string): void;
  removeFavourites(guid: string): void;
  isFavourite(guid: string): boolean;
}
