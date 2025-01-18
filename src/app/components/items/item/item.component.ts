import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { TitleService } from 'src/app/services/title.service';
import { MatIcon } from '@angular/material/icon';
import { WikiLinkComponent } from '../../util/wiki-link/wiki-link.component';
import { ItemSubIconsComponent } from '../item-icon/item-subicons/item-subicons.component';
import { ItemIconComponent } from '../item-icon/item-icon.component';
import { NgIf } from '@angular/common';
import { OverlayComponent } from '@app/components/layout/overlay/overlay.component';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, ItemIconComponent, ItemSubIconsComponent, WikiLinkComponent, MatIcon, RouterLink, OverlayComponent]
})
export class ItemComponent implements OnInit {
  item?: IItem;

  dyePreviewMode: 0 | 1 | 2 = 0;

  navSource?: INavigationTarget;
  navList?: INavigationTarget;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
    private readonly _titleService: TitleService,
    private readonly _route: ActivatedRoute,
  ) {
    _route.paramMap.subscribe(params => {
      this.onParamsChanged(params);
    });
  }

  ngOnInit(): void {
  }

  onParamsChanged(params: ParamMap): void {
    const guid = params.get('guid');
    this.item = guid ? this._dataService.guidMap.get(guid) as IItem : undefined;
    this._titleService.setTitle(this.item?.name || 'Item');

    this.navSource = this.item ? NavigationHelper.getItemSource(this.item) : undefined;
    this.navList = this.item ? NavigationHelper.getItemListLink(this.item) : undefined;
  }

  toggleFavourite(item: IItem): void {
    item.favourited = !item.favourited;
    item.favourited ? this._storageService.addFavourites(item.guid) : this._storageService.removeFavourites(item.guid);
    this._eventService.itemFavourited.next(item);
  }

  preventDefault(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
