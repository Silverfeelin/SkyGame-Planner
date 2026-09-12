import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DateHelper } from '@app/helpers/date-helper';
import { DataService } from '@app/services/data.service';
import { AtmosQuickActionsComponent } from '@app/redesign/shared/quick-actions/atmos-quick-actions.component';

@Component({
  selector: 'atmos-season-quick-actions',
  templateUrl: './atmos-season-quick-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon, AtmosQuickActionsComponent]
})
export class AtmosSeasonQuickActionsComponent {
  private readonly _dataService = inject(DataService);

  wikiHref = input<string>();
  calendarHref = input<string>();

  /** Seasons with friendship levels are handled by the optimizer instead of the calculator. */
  readonly hasTiers = computed(() => {
    const seasons = this._dataService.seasonConfig.items;
    const season = DateHelper.getActive(seasons) || seasons.at(-1);
    return !!season?.spirits.some(s => s.tree?.tier);
  });
}
