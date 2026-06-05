import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import packageJson from '../../../../package.json';

interface ICreditPerson {
  readonly name: string;
  readonly handle: string;
}

interface ICreditGroup {
  readonly intro: string;
  readonly people: ReadonlyArray<ICreditPerson>;
}

@Component({
  selector: 'app-atmos-info',
  templateUrl: './atmos-info.component.html',
  styleUrl: './atmos-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, RouterLink]
})
export class AtmosInfoComponent {
  readonly version: string = (packageJson as { version: string }).version;

  readonly wikiCredits: ICreditGroup = {
    intro: 'Many icons on the wiki are contributed to the wiki by:',
    people: [
      { name: 'Morybel', handle: 'morybel' },
      { name: 'Mimi',    handle: 'mimi4117' },
      { name: 'Ray',     handle: 'ray808080' }
    ]
  };

  readonly stoatCredit: ICreditGroup = {
    intro:
      'A huge thank you to Stoat, the creator of the Sky Season Calculator and Sky Event Calculator, ' +
      'for the inspiration and being okay with Sky Planner including its own calculators.',
    people: [{ name: 'Stoat', handle: '.stoat.' }]
  };

  readonly plutoyCredit: ICreditGroup = {
    intro:
      'Special thanks to Plutoy, the creator of the Sky Shards website, ' +
      'for allowing use of the shard prediction code on the dashboard of the Sky Planner.',
    people: [{ name: 'Plutoy', handle: 'plutoy' }]
  };

  readonly lailaCredit: ICreditGroup = {
    intro:
      'Inspiration and suggestions for the Outfit Request tools by Laila, Morybel, cysketch, rain, luci, ' +
      'kodahonk, ycn, oby, HelloCrater, TN24680 and more. Thank you! ' +
      'Backgrounds for the outfit request images generously provided by Laila.',
    people: [{ name: 'Laila', handle: '_laila__' }]
  };
}
