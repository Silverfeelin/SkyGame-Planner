import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoDataComponent {}
