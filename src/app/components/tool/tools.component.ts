import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { PAGES } from '@app/navigation/pages';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';

interface IToolCard {
  readonly title: string;
  readonly icon: string;
  readonly iconUrl?: string;
  readonly imageUrl: string;
  readonly description: string;
  readonly links: ReadonlyArray<IToolLink>;
}

interface IToolLink {
  readonly icon: string;
  readonly label: string;
  readonly link?: string;
  readonly queryParams?: Record<string, string>;
  readonly href?: string;
}

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrl: './tools.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, SectionQuickActionsComponent]
})
export class ToolsComponent {
  readonly cards: ReadonlyArray<IToolCard> = [
    {
      title: 'Quick start',
      imageUrl: '/assets/images/quick-start.webp',
      icon: 'auto_awesome',
      description: 'Add screenshots of your closet, or mark items by hand, and we\'ll work out which items, spirits and seasons you already have.',
      links: [
        { icon: 'auto_awesome', label: 'Set up my progress', link: PAGES.quickStart.link }
      ]
    },
    {
      title: 'Outfit request',
      imageUrl: '/assets/images/outfit-request.webp',
      icon: 'checkroom',
      description: 'Pick items from your closet, share an outfit request link or build a collage to show off your style.',
      links: [
        { icon: 'checkroom', label: 'Sky closet',     link: PAGES.closet.link },
        { icon: 'add',       label: 'Create request', link: PAGES.outfitRequest.link },
        { icon: 'image',     label: 'Create collage', link: PAGES.collage.link },
        { icon: 'link',      label: 'Outfit vault',   link: PAGES.outfitVault.link }
      ]
    },
    {
      title: 'Item unlock calculator',
      imageUrl: '/assets/images/cost-calculator.webp',
      icon: 'calculate',
      description: 'Pick items to unlock and see exactly how much candle, heart and ascended-candle you still need.',
      links: [
        { icon: 'calculate', label: 'Open calculator', link: PAGES.itemCost.link }
      ]
    },
    {
      title: 'Sky Shards',
      imageUrl: '/assets/images/sky-shards.webp',
      icon: 'auto_awesome_motion',
      iconUrl: '/assets/external/wiki-shard-red.webp',
      description: 'A website by Plutoy to view the time and location of shards.',
      links: [
        { icon: 'open_in_new', label: 'Go to website', href: 'https://sky-shards.pages.dev/' }
      ]
    },
    {
      title: 'Sky Clock',
      imageUrl: '/assets/images/sky-clock.webp',
      icon: 'schedule',
      description: 'A website by Chris Stead to view the time of events such as the geyser in Sky.',
      links: [
        { icon: 'open_in_new', label: 'Go to website', href: 'https://sky-clock.netlify.app/' }
      ]
    }
  ];
}
