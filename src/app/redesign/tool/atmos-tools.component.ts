import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { AtmosToolQuickActionsComponent } from './quick-actions/atmos-tool-quick-actions.component';

interface IToolCard {
  readonly title: string;
  readonly icon: string;
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
  selector: 'app-atmos-tools',
  templateUrl: './atmos-tools.component.html',
  styleUrl: './atmos-tools.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, AtmosToolQuickActionsComponent]
})
export class AtmosToolsComponent {
  readonly cards: ReadonlyArray<IToolCard> = [
    {
      title: 'Outfit request',
      icon: 'checkroom',
      description: 'Pick items from your closet, share an outfit request link or build a collage to show off your style.',
      links: [
        { icon: 'checkroom', label: 'Sky closet',     link: '/outfit-request/closet' },
        { icon: 'add',       label: 'Create request', link: '/outfit-request/request' },
        { icon: 'image',     label: 'Create collage', link: '/outfit-request/collage' },
        { icon: 'link',      label: 'Outfit vault',   link: '/outfit-request/vault' }
      ]
    },
    {
      title: 'Item unlock calculator',
      icon: 'calculate',
      description: 'Pick items to unlock and see exactly how much candle, heart and ascended-candle you still need.',
      links: [
        { icon: 'calculate', label: 'Open calculator', link: '/item/unlock-calculator' }
      ]
    },
    {
      title: 'Item inflation',
      icon: 'trending_up',
      description: 'See how item costs have changed over time across spirits, events and seasons.',
      links: [
        { icon: 'trending_up', label: 'View inflation', link: '/item/inflation' }
      ]
    },
    {
      title: 'Field guide',
      icon: 'menu_book',
      description: 'Group items by location, type or other facets to plan your collection.',
      links: [
        { icon: 'menu_book', label: 'Open field guide', link: '/item/field-guide' }
      ]
    },
    {
      title: 'Children of Light',
      icon: 'auto_awesome',
      description: 'Track Children of Light collected across realms.',
      links: [
        { icon: 'auto_awesome', label: 'Open tracker', link: '/col' }
      ]
    },
    {
      title: 'Wing buffs',
      icon: 'air',
      description: 'Track wing buffs collected from elder spirits.',
      links: [
        { icon: 'air', label: 'Open tracker', link: '/wing-buff' }
      ]
    },
    {
      title: 'Currency spent',
      icon: 'wallet',
      description: 'Log currency you have spent outside of tracked items.',
      links: [
        { icon: 'wallet', label: 'View ledger', link: '/currency/spent' }
      ]
    },
    {
      title: 'Dye plant tracker',
      icon: 'local_florist',
      description: 'A collaborative tracker for dye plants in Sky.',
      links: [
        { icon: 'language', label: 'Go to website', href: 'https://dyes.sky-planner.com/' }
      ]
    },
    {
      title: 'Sky Shards',
      icon: 'auto_awesome_motion',
      description: 'A website by Plutoy to view the time and location of shards.',
      links: [
        { icon: 'language', label: 'Go to website', href: 'https://sky-shards.pages.dev/' }
      ]
    },
    {
      title: 'Sky Clock',
      icon: 'schedule',
      description: 'A website by Chris Stead to view the time of events such as the geyser in Sky.',
      links: [
        { icon: 'schedule', label: 'Go to website', href: 'https://sky-clock.netlify.app/' }
      ]
    }
  ];
}
