import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { IIAP } from 'skygame-data';

/**
 * Atmospheric in-app-purchase summary card. Mirrors `IapCardComponent` inputs.
 * Toggle handlers are surfaced as outputs so the parent page can wire them up
 * to `IAPService` without coupling this widget to game-state services.
 */
@Component({
  selector: 'app-atmos-iap-card',
  templateUrl: './atmos-iap-card.component.html',
  styleUrl: './atmos-iap-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent]
})
export class AtmosIapCardComponent {
  readonly iap = input.required<IIAP>();
  readonly highlightIap = input<string | undefined>(undefined);

  readonly purchasedToggle = output<MouseEvent>();
  readonly giftedToggle = output<MouseEvent>();

  readonly isHighlighted = computed<boolean>(() => this.highlightIap() === this.iap().guid);

  onPurchasedClick(event: MouseEvent): void {
    event.stopPropagation();
    this.purchasedToggle.emit(event);
  }

  onGiftedClick(event: MouseEvent): void {
    event.stopPropagation();
    this.giftedToggle.emit(event);
  }
}
