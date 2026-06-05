import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClosetComponent } from '@app/components/outfit-request/closet/closet.component';

@Component({
  selector: 'app-atmos-closet',
  templateUrl: './atmos-closet.component.html',
  styleUrl: './atmos-closet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClosetComponent]
})
export class AtmosClosetComponent {}
