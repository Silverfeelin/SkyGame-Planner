import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { CheckboxComponent } from '@app/components/shared/checkbox/checkbox.component';
import { IIAP } from 'skygame-data';

/**
 * In-app-purchase summary card. Toggle handlers are surfaced as outputs so the
 * parent page can wire them up to `IAPService` without coupling this widget to
 * game-state services.
 */
@Component({
  selector: 'app-iap-card',
  templateUrl: './iap-card.component.html',
  styleUrl: './iap-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, ItemIconComponent, RouterLink, CheckboxComponent]
})
export class IapCardComponent {
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
