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
  '/assets/game/dyes/hair/2slots_Assembly_march.jpg',
  '/assets/game/dyes/hair/2slots_Assembly_ultpot.jpg',
  '/assets/game/dyes/hair/2slots_Dreams_yeti.jpg',
  '/assets/game/dyes/hair/2slots_Moments_geologist.jpg',
  '/assets/game/dyes/hair/2slots_Performance_storyteller.jpg',
  '/assets/game/dyes/hair/Abyss_angler.jpg',
  '/assets/game/dyes/hair/Assembly_cadet.jpg',
  '/assets/game/dyes/hair/Assembly_daydream.jpg',
  '/assets/game/dyes/hair/Assembly_march.jpg',
  '/assets/game/dyes/hair/Assembly_scold.jpg',
  '/assets/game/dyes/hair/Assembly_ultpot.jpg',
  '/assets/game/dyes/hair/Base_moth.jpg',
  '/assets/game/dyes/hair/Belonging_confetti.jpg',
  '/assets/game/dyes/hair/Belonging_sparkler.jpg',
  '/assets/game/dyes/hair/Dreams_DP.jpg',
  '/assets/game/dyes/hair/Dreams_mentor.jpg',
  '/assets/game/dyes/hair/Dreams_yeti.jpg',
  '/assets/game/dyes/hair/Feast_pombeanie.jpg',
  '/assets/game/dyes/hair/Feast_santa.jpg',
  '/assets/game/dyes/hair/Flight_LW.jpg',
  '/assets/game/dyes/hair/Flight_builder.jpg',
  '/assets/game/dyes/hair/Flight_chimesmith.jpg',
  '/assets/game/dyes/hair/Flight_navi.jpg',
  '/assets/game/dyes/hair/Fortune_fishe.jpg',
  '/assets/game/dyes/hair/Fortune_pompom.jpg',
  '/assets/game/dyes/hair/Fortune_snek.jpg',
  '/assets/game/dyes/hair/Gratitude_Provoke.jpg',
  '/assets/game/dyes/hair/Gratitude_Sassy.jpg',
  '/assets/game/dyes/hair/Gratitude_yoga.jpg',
  '/assets/game/dyes/hair/Lightseeker_crab.jpg',
  '/assets/game/dyes/hair/Lightseeker_doublefive.jpg',
  '/assets/game/dyes/hair/Lightseeker_piggyback.jpg',
  '/assets/game/dyes/hair/Moments_geologist.jpg',
  '/assets/game/dyes/hair/Moments_monk.jpg',
  '/assets/game/dyes/hair/Music_bandhat.jpg',
  '/assets/game/dyes/hair/Passage_overachiever.jpg',
  '/assets/game/dyes/hair/Passage_tumble.jpg',
  '/assets/game/dyes/hair/Performance_mellow.jpg',
  '/assets/game/dyes/hair/Performance_modest.jpg',
  '/assets/game/dyes/hair/Performance_stagehand.jpg',
  '/assets/game/dyes/hair/Performance_storyteller.jpg',
  '/assets/game/dyes/hair/Remembrance_child.jpg',
  '/assets/game/dyes/hair/Remembrance_tiptoe.jpg',
  '/assets/game/dyes/mask/Base_sleepy.jpg',
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
