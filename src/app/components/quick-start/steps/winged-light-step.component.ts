import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IRealm } from 'skygame-data';
import { QuickStartStore } from '../quick-start.store';
import { QuickStartStepNavComponent } from '../step-nav/quick-start-step-nav.component';

interface RealmRow {
  realm: IRealm;
  count: number;
}

@Component({
  selector: 'app-quick-start-winged-light-step',
  templateUrl: './winged-light-step.component.html',
  styleUrl: './winged-light-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, QuickStartStepNavComponent]
})
export class WingedLightStepComponent {
  readonly store = inject(QuickStartStore);

  readonly rows: Array<RealmRow> = this.store.realms.map(realm => ({
    realm,
    count: realm.areas?.reduce((n, a) => n + (a.wingedLights?.length ?? 0), 0) ?? 0
  }));
  readonly total = this.rows.reduce((n, r) => n + r.count, 0);

  readonly allSelected = computed(() => this.rows.every(r => this.store.wingedLightRealms().has(r.realm.guid)));
  readonly selectedCount = computed(() => {
    const selected = this.store.wingedLightRealms();
    return this.rows.reduce((n, r) => n + (selected.has(r.realm.guid) ? r.count : 0), 0);
  });

  toggleAll(): void {
    this.store.wingedLightRealms.set(this.allSelected() ? new Set() : new Set(this.rows.map(r => r.realm.guid)));
  }
}
