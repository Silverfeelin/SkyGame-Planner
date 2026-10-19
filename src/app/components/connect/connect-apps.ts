import { DataService } from '@app/services/data.service';
import { StorageService } from '@app/services/storage.service';
import { version } from '../../../../node_modules/skygame-data/package.json';

export type ConnectScopeKey = 'items.unlocked';

export interface IConnectScope {
  label: string;
  description: string;
  icon: string;
  count: (data: DataService) => number;
  resolve: (data: DataService, storage: StorageService) => unknown;
}

export interface IConnectApp {
  name: string;
  url: string;
  origins: Array<string>;
  scopes: Array<ConnectScopeKey>;
  /** Whether the app may send item collections to /connect/collection. */
  collections?: boolean;
}

export interface IConnectCollectionReady {
  type: 'sky-planner:collection:ready';
  nonce?: string;
  version: 1;
}

export interface IConnectCollection {
  type: 'sky-planner:collection';
  nonce?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  items: Array<string>;
}

export interface IConnectCollectionAck {
  type: 'sky-planner:collection:ack';
  nonce?: string;
}

export interface IConnectResponse {
  type: 'sky-planner:connect';
  nonce?: string;
  status: 'granted' | 'denied';
  version: 1;
  dataVersion: string;
  scopes: Partial<Record<ConnectScopeKey, unknown>>;
}

export interface IConnectAck {
  type: 'sky-planner:connect:ack';
  nonce?: string;
}

const unlockedItemGuids = (data: DataService) => data.itemConfig.items.filter(i => i.unlocked).map(i => i.guid);

export const CONNECT_SCOPES: Record<ConnectScopeKey, IConnectScope> = {
  'items.unlocked': {
    label: 'Unlocked items',
    description: 'The items you have marked as unlocked.',
    icon: 'checkroom',
    count: data => unlockedItemGuids(data).length,
    resolve: (data, storage) => ({
      items: unlockedItemGuids(data),
      date: storage.provider._lastDate.toISO() ?? undefined
    })
  }
};

export const CONNECT_APPS: Record<string, IConnectApp> = {
  tsc: {
    name: 'That Sky Collection',
    url: 'https://thatskycollection.com',
    origins: ['https://thatskycollection.com', 'https://sc-dev.novaxeros.net', 'https://sc-fast.novaxeros.net', 'http://localhost:3000'],
    scopes: ['items.unlocked'],
    collections: true
  }
};

export const CONNECT_DATA_VERSION = version;
