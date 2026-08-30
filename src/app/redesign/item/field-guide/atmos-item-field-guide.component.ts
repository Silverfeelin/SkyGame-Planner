import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TooltipDirective } from '@app/directives/tooltip.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { inject, DestroyRef } from '@angular/core';
import { IItem, ItemType } from 'skygame-data';
import { DataService } from '@app/services/data.service';
import { INavigationTarget, NavigationHelper } from '@app/helpers/navigation-helper';
import { ItemIconComponent } from '@app/components/items/item-icon/item-icon.component';
import { ItemSubIconsComponent } from '@app/components/items/item-icon/item-subicons/item-subicons.component';
import { ItemTypeSelectorComponent } from '@app/components/items/item-type-selector/item-type-selector.component';
import { AtmosItemQuickActionsComponent } from '../quick-actions/atmos-item-quick-actions.component';

interface IFieldGuideItem {
  item: IItem;
  nav?: INavigationTarget;
}

@Component({
  selector: 'app-atmos-item-field-guide',
  templateUrl: './atmos-item-field-guide.component.html',
  styleUrl: './atmos-item-field-guide.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink, MatIcon, TooltipDirective,
    ItemTypeSelectorComponent, ItemIconComponent, ItemSubIconsComponent,
    AtmosItemQuickActionsComponent
  ]
})
export class AtmosItemFieldGuideComponent {
  private readonly _dataService = inject(DataService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  readonly types: ReadonlyArray<ItemType> = [
    ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
    ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
    ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
    ItemType.Cape, ItemType.Held, ItemType.Furniture, ItemType.Prop
  ];

  readonly type = signal<ItemType>(ItemType.Outfit);
  readonly viewingSource = signal(false);

  readonly typeItems: Record<string, ReadonlyArray<IFieldGuideItem>>;
  readonly loadedTypes = signal<ReadonlySet<string>>(new Set([ItemType.Outfit]));

  readonly currentItems = computed<ReadonlyArray<IFieldGuideItem>>(() => this.typeItems[this.type()] ?? []);

  constructor() {
    this.typeItems = this.initializeItems();

    this._route.queryParamMap.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(params => {
      const t = (params.get('type') as ItemType) || ItemType.Outfit;
      this.type.set(t);
      this.loadedTypes.update(set => {
        if (set.has(t)) { return set; }
        const next = new Set(set); next.add(t); return next;
      });
    });
  }

  onTypeChanged(type: ItemType): void {
    this.type.set(type);
    this.loadedTypes.update(set => {
      if (set.has(type)) { return set; }
      const next = new Set(set); next.add(type); return next;
    });
    const queryParams: Params = { type };
    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  toggleViewingSource(): void {
    this.viewingSource.update(v => !v);
  }

  checkViewSource(url: string | undefined): void {
    if (!this.viewingSource() || !url) { return; }

    if (!url.startsWith('https://static.wikia.nocookie.net/sky-children-of-the-light')) {
      alert(`Can't view the source since this image is not hosted on the official wiki.`);
      return;
    }

    const file = url.match(/[^/]*$/)?.[0];
    if (!file) {
      alert(`Can't find the file name.`);
      return;
    }

    window.open(`https://sky-children-of-the-light.fandom.com/wiki/File:${file}`, '_blank');
  }

  isTypeLoaded(type: ItemType): boolean {
    return this.loadedTypes().has(type);
  }

  private initializeItems(): Record<string, ReadonlyArray<IFieldGuideItem>> {
    const typeItems: Record<string, Array<IFieldGuideItem>> = {};
    for (const type in ItemType) { typeItems[type] = []; }

    this._dataService.itemConfig.items.forEach(item => {
      if (!item.previewUrl) { return; }
      const nav = NavigationHelper.getItemLink(item);
      typeItems[item.type].push({ item, nav });
    });

    for (const type in ItemType) {
      typeItems[type].sort((a, b) => (a.item.order ?? 99999) - (b.item.order ?? 99999));
    }

    return typeItems;
  }
}
