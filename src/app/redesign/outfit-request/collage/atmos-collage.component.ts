import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CollageComponent } from '@app/components/outfit-request/collage/collage.component';

@Component({
  selector: 'app-atmos-collage',
  templateUrl: './atmos-collage.component.html',
  styleUrl: './atmos-collage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CollageComponent]
})
export class AtmosCollageComponent {}
