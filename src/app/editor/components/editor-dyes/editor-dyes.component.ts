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
  "/assets/game/dyes/2slots_Bluebird_mask.jpg",
  "/assets/game/dyes/2slots_Bluebird_touslecape.jpg",
  "/assets/game/dyes/2slots_Bluebird_touslepants.jpg",
  "/assets/game/dyes/2slots_Colour_beaniebraid.jpg",
  "/assets/game/dyes/2slots_Colour_facepaint.jpg",
  "/assets/game/dyes/2slots_Colour_radipants.jpg",
  "/assets/game/dyes/2slots_Colour_saturncape.jpg",
  "/assets/game/dyes/Bluebird_beetlecape.jpg",
  "/assets/game/dyes/Bluebird_confettidress.jpg",
  "/assets/game/dyes/Bluebird_confettihat.jpg",
  "/assets/game/dyes/Bluebird_grandpacape.jpg",
  "/assets/game/dyes/Bluebird_mask.jpg",
  "/assets/game/dyes/Bluebird_pleafulboots.jpg",
  "/assets/game/dyes/Bluebird_pleafulpants.jpg",
  "/assets/game/dyes/Bluebird_touslecape.jpg",
  "/assets/game/dyes/Bluebird_tousleheadphones.jpg",
  "/assets/game/dyes/Bluebird_touslepants.jpg",
  "/assets/game/dyes/Bluebird_whitecape.jpg",
  "/assets/game/dyes/Colour_beaniebraid.jpg",
  "/assets/game/dyes/Colour_facepaint.jpg",
  "/assets/game/dyes/Colour_radipants.jpg",
  "/assets/game/dyes/Colour_saturncape.jpg",
  "/assets/game/dyes/Nature_swirlmask.jpg",
  "/assets/game/dyes/Nature_swirlpants.jpg",
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
