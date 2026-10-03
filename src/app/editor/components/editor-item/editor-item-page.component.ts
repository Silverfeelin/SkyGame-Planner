import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { EditorItemComponent } from './editor-item.component';
import { ItemIconComponent } from '@app/components/item/icon/item-icon.component';
import { DataService } from '@app/services/data.service';
import { IItem } from 'skygame-data';

@Component({
  selector: 'app-editor-item-page',
  templateUrl: './editor-item-page.component.html',
  styleUrl: './editor-item-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EditorItemComponent, ItemIconComponent, MatIcon, RouterLink],
})
export class EditorItemPageComponent {
  private readonly _dataService = inject(DataService);
  private readonly _route = inject(ActivatedRoute);

  readonly guid = toSignal(this._route.paramMap.pipe(map(params => params.get('guid'))), { requireSync: true });

  readonly isNew = computed(() => !this.guid());

  readonly item = computed(() => {
    const guid = this.guid();
    return guid ? this._dataService.itemConfig.items.find(item => item.guid === guid) : undefined;
  });

  readonly notFound = computed(() => !this.isNew() && !this.item());

  navigateBack(): void {
    history.back();
  }

  save(evt: IItem) {
    evt.id = this.item()?.id ?? 0;
    const json = JSON.stringify(evt, undefined, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Item_${evt.guid}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
