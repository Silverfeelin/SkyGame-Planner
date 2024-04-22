import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { INavigationTarget, NavigationHelper } from 'src/app/helpers/navigation-helper';
import { IItem } from 'src/app/interfaces/item.interface';
import { DataService } from 'src/app/services/data.service';
import { EventService } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {
  item?: IItem;

  navSource?: INavigationTarget;
  navList?: INavigationTarget;
  navFieldGuide?: INavigationTarget;

  constructor(
    private readonly _dataService: DataService,
    private readonly _eventService: EventService,
    private readonly _storageService: StorageService,
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
    this.navSource = this.item ? NavigationHelper.getItemSource(this.item) : undefined;
    this.navList = this.item ? NavigationHelper.getItemListLink(this.item) : undefined;
    this.navFieldGuide = this.item ? NavigationHelper.getPreviewLink(this.item) : undefined;
  }

  toggleFavourite(item: IItem): void {
    item.favourited = !item.favourited;
    item.favourited ? this._storageService.addFavourites(item.guid) : this._storageService.removeFavourites(item.guid);
    this._eventService.itemFavourited.next(item);
  }
}
