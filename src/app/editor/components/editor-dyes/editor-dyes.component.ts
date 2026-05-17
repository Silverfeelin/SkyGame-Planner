/**
 * This component was set up to map a list of preview images to their respective items.
 * The arrays are generated using /scripts/dye-files.js.
 */

import { Component, inject } from '@angular/core';
import { ItemClickEvent, ItemsComponent } from '@app/components/items/items.component';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { DataService } from '@app/services/data.service';
import { IItem } from 'skygame-data';

const fileNames = [
  'https://sky-planner.com/assets/game/dyes/Carnival_jugglerruffle.jpg',
  'https://sky-planner.com/assets/game/dyes/outfit/2slots_Carnival_dancerpants.jpg',
  'https://sky-planner.com/assets/game/dyes/outfit/2slots_Carnival_stuntpants.jpg',
  'https://sky-planner.com/assets/game/dyes/outfit/Carnival_dancerpants.jpg',
  'https://sky-planner.com/assets/game/dyes/outfit/Carnival_directorpants.jpg',
  'https://sky-planner.com/assets/game/dyes/outfit/Carnival_jugglerpants.jpg',
  'https://sky-planner.com/assets/game/dyes/outfit/Carnival_stuntpants.jpg',
  'https://sky-planner.com/assets/game/dyes/outfit/Treasure_fempants.jpg',
  'https://sky-planner.com/assets/game/dyes/mask/Base_sleepy.jpg',
  'https://sky-planner.com/assets/game/dyes/mask/Carnival_dancermask.jpg',
  'https://sky-planner.com/assets/game/dyes/mask/Carnival_jugglermask.jpg',
  'https://sky-planner.com/assets/game/dyes/hair-accessory/Carnival_stuntgoggles.jpg',
  'https://sky-planner.com/assets/game/dyes/hair-accessory/Treasure_hat.jpg',
  'https://sky-planner.com/assets/game/dyes/hair/Carnival_stunthat.jpg',
  'https://sky-planner.com/assets/game/dyes/hair/Treasure_bandannahair.jpg',
  'https://sky-planner.com/assets/game/dyes/cape/2slots_Treasure_coincape.jpg',
  'https://sky-planner.com/assets/game/dyes/cape/Carnival_dancercape.jpg',
  'https://sky-planner.com/assets/game/dyes/cape/Carnival_stuntcape.jpg',
  'https://sky-planner.com/assets/game/dyes/cape/Carnival_ultcape.jpg',
  'https://sky-planner.com/assets/game/dyes/cape/Treasure_coincape.jpg'
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
