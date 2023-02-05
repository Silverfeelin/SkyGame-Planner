import { Component } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NodeHelper } from './helpers/node-helper';
import { ISpiritTree } from './interfaces/spirit-tree.interface';
import { DataService } from './services/data.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'SkyGame-Planner';

  spiritTrees?: Array<ISpiritTree>;
  ready = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _storageService: StorageService,
    private readonly _domSanitizer: DomSanitizer,
    private readonly _matIconRegistry: MatIconRegistry
  ) {
    this._dataService.onData.subscribe(() => { this.onData(); });
    _matIconRegistry.addSvgIconSet(_domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/icons.svg'));
  }

  onData(): void {
    this.spiritTrees = this._dataService.spiritTreeConfig.items.filter(v => NodeHelper.find(v.node,
      n => !!n.sh || n.guid == 'jav8BsPwoS' || n.guid === 'ow2YTE45OX'));
    this.ready = true;
  }
}
