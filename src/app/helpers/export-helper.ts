import { DateTime } from 'luxon';
import type { StorageService } from '@app/services/storage.service';
import { IStorageExport } from '@app/services/storage/storage-provider.interface';

/** File format of Export and Import in the settings. */
export interface IExport {
  version: string;
  storageData: IStorageExport;
  closetData: {
    hidden: Array<string>;
  };
}

export class ExportHelper {
  /** Downloads the tracked data as a JSON file that can be imported from the settings. */
  static download(storage: StorageService): void {
    const data: IExport = {
      version: '1.1.0',
      storageData: storage.export(),
      closetData: {
        hidden: JSON.parse(localStorage.getItem('closet.hidden') || '[]'),
      }
    };

    const jsonData = JSON.stringify(data);
    let url = '';
    try {
      const blob = new Blob([jsonData], { type: 'application/json' });
      url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SkyPlanner_${DateTime.now().toFormat('yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
