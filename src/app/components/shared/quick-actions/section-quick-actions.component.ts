import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { IPage, PageId, SECTIONS, SectionId, getPage } from '@app/navigation/pages';
import { QuickActionsComponent } from './quick-actions.component';

const MATCH_WITH_QUERY: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'exact',
  matrixParams: 'ignored',
  fragment: 'ignored'
};
const MATCH_EXACT = { exact: true };
const MATCH_SUBSET = { exact: false };

/** Quick actions row for a section, generated from its page list. */
@Component({
  selector: 'app-section-quick-actions',
  templateUrl: './section-quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon, QuickActionsComponent]
})
export class SectionQuickActionsComponent {
  private readonly _dataService = inject(DataService);

  readonly section = input.required<SectionId>();

  readonly pages = computed(() => {
    const ids: ReadonlyArray<PageId> = SECTIONS[this.section()].pages;
    return ids
      .map(id => ({ id, page: getPage(id) }))
      .filter(({ page }) => page.visible?.(this._dataService) ?? true);
  });

  activeOptions(page: IPage): IsActiveMatchOptions | { exact: boolean } {
    if (page.exact === 'withQuery') { return MATCH_WITH_QUERY; }
    return page.exact ? MATCH_EXACT : MATCH_SUBSET;
  }
}
