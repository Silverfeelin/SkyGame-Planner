import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

interface ICreditPerson {
  readonly name: string;
  readonly handle: string;
}

interface ICreditGroup {
  readonly intro: string;
  readonly people: ReadonlyArray<ICreditPerson>;
}

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, RouterLink]
})
export class InfoComponent {
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

  readonly novaxerosCredit: ICreditGroup = {
    intro:
      'Special thanks to NovaXeros for building That Sky Collection (TSC) and for collaborating on several features.\n' +
      'Thanks to this, you can see similar fits from TSC while creating an outfit request, receive outfits from TSC ' +
      'as item collections and quickly find outfits that use an item directly from the item detail page.',
    people: [{ name: 'NovaXeros', handle: 'novaxeros' }]
  };
}
