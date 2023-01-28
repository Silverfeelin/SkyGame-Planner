import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { IRow } from '../grid/grid.component';

@Component({
  selector: 'app-constellations',
  templateUrl: './constellations.component.html',
  styleUrls: ['./constellations.component.less']
})
export class ConstellationsComponent {

  constructor(
    private readonly _dataService: DataService
  ) {

  }
}
