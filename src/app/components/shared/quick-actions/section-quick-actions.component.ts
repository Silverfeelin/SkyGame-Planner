import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DataService } from '@app/services/data.service';
import { PageId, SECTIONS, SectionId, getPage } from '@app/navigation/pages';
import { pageActiveOptions } from '@app/navigation/page-active-options';
import { QuickActionsComponent } from './quick-actions.component';

/** Quick actions row for a section, generated from its page list. Hidden wherever the sidebar lists the same pages. */
@Component({
  selector: 'app-section-quick-actions',
  templateUrl: './section-quick-actions.component.html',
  styleUrl: './section-quick-actions.component.scss',
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

  readonly activeOptions = pageActiveOptions;
}
