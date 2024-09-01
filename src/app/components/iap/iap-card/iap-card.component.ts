import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { IIAP } from '@app/interfaces/iap.interface';
import { IShop } from '@app/interfaces/shop.interface';
import { IAPService } from '@app/services/iap.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-iap-card',
  standalone: true,
  imports: [ItemIconComponent, RouterLink, MatIcon, NgbTooltip],
  templateUrl: './iap-card.component.html',
  styleUrl: './iap-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IapCardComponent implements OnChanges {
  @Input() iap!: IIAP;
  @Input() highlightIap?: string;

  shop?: IShop;

  constructor(
    private readonly _iapService: IAPService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['iap']) {
      this.shop = this.iap.shop;
    }
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    this._iapService.togglePurchased(iap);
  }

  toggleGifted(event: MouseEvent, iap: IIAP): void {
    this._iapService.toggleGifted(iap);
  }
}
