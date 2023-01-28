import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-realms',
  templateUrl: './realms.component.html',
  styleUrls: ['./realms.component.less']
})
export class RealmsComponent {
  constructor(
    private readonly _dataService: DataService
  ) {}
}
