import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DYE_COLORS, DyeColor, IDye } from '@app/interfaces/dye.interface';
import { StorageService } from './storage.service';

/** One blend per dye slot of the item. */
export type ItemDyeVersion = Array<IDye>;

/** The two custom versions of an item; undefined when not set. The default version can't be changed. */
export type ItemDyeVersions = [ItemDyeVersion | undefined, ItemDyeVersion | undefined];

/**
 * Item guid to both versions as base36 dye indices (0 for none), four per version:
 * main and blend dye of the primary slot followed by those of the secondary slot.
 * This matches the dye format of outfit request links.
 */
type IStorageDyeVersions = { [guid: string]: string };

const STORAGE_KEY = 'item.dyes';
const VERSION_LENGTH = 4;
const EMPTY: IStorageDyeVersions = {};

@Injectable({ providedIn: 'root' })
export class ItemDyeVersionService {
  private readonly _storageService = inject(StorageService);

  private readonly _stored = signal<IStorageDyeVersions>(EMPTY);

  constructor() {
    this.load();
    // Picks up Dropbox syncs and changes from other tabs.
    this._storageService.events.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  get(guid: string): ItemDyeVersions {
    const value = this._stored()[guid] ?? '';
    return [
      decodeVersion(value.substring(0, VERSION_LENGTH)),
      decodeVersion(value.substring(VERSION_LENGTH, VERSION_LENGTH * 2))
    ];
  }

  count(guid: string): number {
    return this.get(guid).filter(v => v).length;
  }

  set(guid: string, index: 0 | 1, version: ItemDyeVersion | undefined): void {
    const versions = this.get(guid);
    versions[index] = version;
    const value = versions.map(encodeVersion).join('');

    const stored = { ...this._stored() };
    if (/^0*$/.test(value)) {
      delete stored[guid];
    } else {
      stored[guid] = value;
    }

    this._stored.set(stored);
    this._storageService.setKey<IStorageDyeVersions>(STORAGE_KEY, stored);
  }

  private load(): void {
    const stored = this._storageService.getKey<IStorageDyeVersions>(STORAGE_KEY) ?? EMPTY;
    if (stored !== this._stored()) { this._stored.set(stored); }
  }
}

function encodeDye(color: DyeColor | undefined): string {
  return color ? (DYE_COLORS.indexOf(color) + 1).toString(36) : '0';
}

function decodeDye(char: string | undefined): DyeColor | undefined {
  return char ? DYE_COLORS[parseInt(char, 36) - 1] : undefined;
}

function encodeVersion(version: ItemDyeVersion | undefined): string {
  const slot = (dye: IDye | undefined) => encodeDye(dye?.primary) + encodeDye(dye?.secondary);
  return slot(version?.[0]) + slot(version?.[1]);
}

function decodeVersion(value: string): ItemDyeVersion | undefined {
  if (!/[^0]/.test(value)) { return undefined; }
  return [
    { primary: decodeDye(value[0]), secondary: decodeDye(value[1]) },
    { primary: decodeDye(value[2]), secondary: decodeDye(value[3]) }
  ];
}
