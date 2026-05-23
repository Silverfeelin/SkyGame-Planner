import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { WindowHelper } from '@app/helpers/window-helper';

export interface IFeatureLink {
  icon?: string;
  imgSrc?: string;
  label: string;
  link?: string;             // internal router link
  queryParams?: Record<string, string>;
  href?: string;             // external link
  hrefDesktop?: string;      // protocol URL preferred on desktop (e.g. discord://)
}

export type CurrencyMarkKind = 'candle' | 'heart' | 'ascended' | 'season' | 'ticket';

export interface IFeatureCurrency {
  kind: CurrencyMarkKind;
  owned: number;
  total: number;
}

const KIND_ICON: Record<CurrencyMarkKind, string> = {
  candle:   'candle',
  season:   'season-candle',
  heart:    'heart',
  ascended: 'ascended-candle',
  ticket:   'ticket'
};

@Component({
  selector: 'app-atmos-feature-card',
  templateUrl: './atmos-feature-card.component.html',
  styleUrl: './atmos-feature-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon]
})
export class AtmosFeatureCardComponent {
  readonly isWindows = WindowHelper.isWindows();

  kindIcon(kind: CurrencyMarkKind): string { return KIND_ICON[kind]; }

  readonly kicker = input<string>('');
  readonly kickerColor = input<string>('var(--atmos-accent)');
  readonly title = input<string>('');
  readonly bannerUrl = input<string | undefined>(undefined);
  readonly bannerContain = input<boolean>(false);
  readonly bannerSilhouette = input<boolean>(false);
  readonly bannerHue = input<number>(160);
  readonly timeRow = input<string>('');
  readonly links = input<ReadonlyArray<IFeatureLink>>([]);
  readonly currency = input<ReadonlyArray<IFeatureCurrency>>([]);
  readonly checkLabel = input<string>('');
  readonly checked = input<boolean>(false);
  readonly checkToggle = output<MouseEvent>();
}
