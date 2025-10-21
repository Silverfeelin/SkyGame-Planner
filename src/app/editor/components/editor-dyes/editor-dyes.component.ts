/**
 * This component was set up to map a list of preview images to their respective items.
 * The arrays are generated using /scripts/dye-files.js.
 */

import { Component, inject } from '@angular/core';
import { IItem } from '@app/interfaces/item.interface';
import { ItemClickEvent, ItemsComponent } from '@app/components/items/items.component';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { DataService } from '@app/services/data.service';

const fileNames = [
  '/assets/game/dyes/2slots_Migration_ulthorns.jpg',
  '/assets/game/dyes/Migration_lighthornglasses.jpg',
  '/assets/game/dyes/Migration_ulthorns.jpg',
  '/assets/game/dyes/shoes/Migration_ultboots.jpg',
  '/assets/game/dyes/outfit/2slots_Migration_jellypants.jpg',
  '/assets/game/dyes/outfit/2slots_Migration_mantapants.jpg',
  '/assets/game/dyes/outfit/2slots_Migration_ultpants.jpg',
  '/assets/game/dyes/outfit/Migration_bird.jpg',
  '/assets/game/dyes/outfit/Migration_jellypants.jpg',
  '/assets/game/dyes/outfit/Migration_mantapants.jpg',
  '/assets/game/dyes/outfit/Migration_ultpants.jpg',
  '/assets/game/dyes/mask/2slots_Mischief_crowmask.jpg',
  '/assets/game/dyes/mask/Base_sleepy.jpg',
  '/assets/game/dyes/mask/Mischief_crowmask.jpg',
  '/assets/game/dyes/head-accessory/2slots_Migration_jellytassels.jpg',
  '/assets/game/dyes/head-accessory/Migration_jellytassels.jpg',
  '/assets/game/dyes/hair/2slots_Migration_mantahawk.jpg',
  '/assets/game/dyes/hair/Migration_lighthornhair.jpg',
  '/assets/game/dyes/hair/Migration_mantahawk.jpg',
  '/assets/game/dyes/cape/2slots_Migration_butterfly.jpg',
  '/assets/game/dyes/cape/2slots_Migration_wingcape.jpg',
  '/assets/game/dyes/cape/Migration_butterfly.jpg',
  '/assets/game/dyes/cape/Migration_lighthorncape.jpg',
  '/assets/game/dyes/cape/Migration_manta.jpg',
  '/assets/game/dyes/cape/Migration_wingcape.jpg',
  '/assets/game/dyes/cape/Mischief_curtaincape.jpg'
];

@Component({
    selector: 'app-editor-dyes',
    templateUrl: './editor-dyes.component.html',
    styleUrls: ['./editor-dyes.component.scss'],
    imports: [ItemsComponent, ItemIconComponent]
})
export class EditorDyesComponent {
  readonly _dataService = inject(DataService);

  currentFileName = '';
  currentFileIndex = -1;

  previewFile = '';
  previewFileMap: { [file: string]: IItem } = {};

  isShowingMapped = false;
  mappedFiles: Array<{guid: string, item: IItem, url: string}> = [];
  unmappedFiles:  Array<string> = [];

  /**
   *
   */
  constructor() {
    this.mappedFiles = this._dataService.itemConfig.items.filter(item => item.dye).map(item => {
      if (item.dye && !item.dye.previewUrl && !item.dye.infoUrl) {
        console.warn('No preview or info url for:', item.guid);
      }

      return [
        item.dye?.previewUrl ? { guid: item.guid, item, url: item.dye.previewUrl } : null,
        item.dye?.infoUrl ? { guid: item.guid, item, url: item.dye.infoUrl } : null,
      ];
    }).flatMap(i => i).filter((i): i is { guid: string, item: IItem, url: string } => i !== null);

    this.unmappedFiles = fileNames.filter(f => !this.mappedFiles.some(m => m.url === f));
  }

  onItemClicked(evt: ItemClickEvent): void {
    this.previewFileMap[this.previewFile] = evt.item;
  }

  onPreviewClicked(file: string): void {
    this.previewFile = file;
    navigator.clipboard.writeText(file);
  }

  export(): void {
    let csv = '';
    Object.keys(this.previewFileMap).filter(k => k).forEach(previewFile => {
      const item = this.previewFileMap[previewFile];
      csv += `${item.guid},${previewFile}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'previews.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
