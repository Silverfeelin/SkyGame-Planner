import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ItemTypePipe } from '@app/pipes/item-type.pipe';
import { ItemType } from 'skygame-data';

export interface IItemTypeNavEntry {
  type: ItemType;
  svgIcon: string;
}

@Component({
  selector: 'atmos-item-type-nav',
  templateUrl: './atmos-item-type-nav.component.html',
  styleUrl: './atmos-item-type-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemTypePipe]
})
export class AtmosItemTypeNavComponent {
  readonly entries = input.required<ReadonlyArray<IItemTypeNavEntry>>();
  readonly active = input<ItemType | undefined>(undefined);
  /** Wrap onto multiple lines instead of scrolling horizontally on one line. */
  readonly wrap = input(false);
  /** Render the entries as regular buttons instead of borderless text pills. */
  readonly buttons = input(false);

  readonly typeSelected = output<ItemType>();
}
