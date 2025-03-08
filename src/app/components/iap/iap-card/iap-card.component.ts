import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { NavigationHelper } from '@app/helpers/navigation-helper';
import { IIAP } from '@app/interfaces/iap.interface';
import { IShop } from '@app/interfaces/shop.interface';
import { IAPService } from '@app/services/iap.service';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-iap-card',
    imports: [ItemIconComponent, RouterLink, MatIcon, NgbTooltip],
    templateUrl: './iap-card.component.html',
    styleUrl: './iap-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IapCardComponent implements OnChanges {
  @Input() iap!: IIAP;
  @Input() highlightIap?: string;

  shop?: IShop;
  otherIap?: IIAP;

  constructor(
    private readonly _iapService: IAPService,
    private readonly _router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['iap']) {
      this.shop = this.iap.shop;
      const otherUnlocked = !this.iap.bought && !this.iap.gifted && this.iap.items ? this.iap.items.find(i => i.unlocked): undefined;
      this.otherIap = otherUnlocked ? otherUnlocked.iaps?.find(iap => iap.bought || iap.gifted) : undefined;
    }
  }

  togglePurchased(event: MouseEvent, iap: IIAP): void {
    if (this.otherIap) { return this.warnUnlocked(); }
    this._iapService.togglePurchased(iap);
  }

  toggleGifted(event: MouseEvent, iap: IIAP): void {
    if (this.otherIap) { return this.warnUnlocked(); }
    this._iapService.toggleGifted(iap);
  }

  private warnUnlocked(): void {
    if (!confirm('You have already unlocked items in this IAP. Do you want to view the page where you unlocked it?')) {
      return;
    }

    const item = this.iap.items!.find(i => i.unlocked)!;
    const link = NavigationHelper.getItemSource(item);
    if (!link) {
      alert(`Couldn't find the page. Please report this issue.`);
      return;
    }
    void this._router.navigate(link.route, link.extras);
  }
}
