import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';

@Component({
  selector: 'app-realm-constellation',
  templateUrl: './realm-constellation.component.html',
  styleUrls: ['./realm-constellation.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealmConstellationComponent {
  @Input() realm!: IRealm;

  @Output() readonly spiritClicked = new EventEmitter<ISpirit>();

  gotoSpirit(spirit: ISpirit): void {
    this.spiritClicked.emit(spirit);
  }
}
