import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { IItem } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { TitleService } from '@app/services/title.service';
import { SectionQuickActionsComponent } from '@app/components/shared/quick-actions/section-quick-actions.component';
import { ItemSummaryComponent } from '../summary/item-summary.component';
import { ItemDyeVersionsComponent } from '../dye-versions/item-dye-versions.component';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrl: './item-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionQuickActionsComponent, ItemSummaryComponent, ItemDyeVersionsComponent]
})
export class ItemDetailComponent {
  private readonly _route = inject(ActivatedRoute);
  private readonly _dataService = inject(DataService);
  private readonly _titleService = inject(TitleService);
  private readonly _destroyRef = inject(DestroyRef);

  readonly item = signal<IItem | undefined>(undefined);
  readonly showTipUnlock = signal(false);

  constructor() {
    this._route.paramMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(params => {
      this.resolveItem(params.get('guid') ?? '');
    });

    this._route.queryParamMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(params => {
      this.showTipUnlock.set(params.get('showTipUnlock') === '1');
    });
  }

  private resolveItem(guid: string): void {
    if (this._dataService.guidMap.size === 0) {
      this._dataService.onData.pipe(take(1)).subscribe(() => this.resolveItem(guid));
      return;
    }

    const item = this._dataService.guidMap.get(guid) as IItem | undefined;
    this.item.set(item);
    this._titleService.setTitle(item?.name ?? 'Item');
  }

  goBack(): void {
    window.history.back();
  }
}
