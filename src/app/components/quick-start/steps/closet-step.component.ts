import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { QuickStartTab } from '@app/services/quick-start/quick-start.model';
import { QuickStartStore, TabStage } from '../quick-start.store';
import { QuickStartStepNavComponent } from '../step-nav/quick-start-step-nav.component';
import { ClosetAddComponent } from '../closet/closet-add.component';
import { ClosetCheckComponent } from '../closet/closet-check.component';
import { ClosetMatchingComponent } from '../closet/closet-matching.component';
import { ClosetConfirmComponent } from '../closet/closet-confirm.component';
import { MusicPanelComponent } from '../closet/music-panel.component';
import { QuickStartEmotesComponent } from '../emotes/quick-start-emotes.component';

type StatusTone = 'plain' | 'done' | 'warn';

interface TabRow {
  tab: QuickStartTab;
  status: string;
  tone: StatusTone;
}

const STAGES: ReadonlyArray<{ stage: TabStage, label: string }> = [
  { stage: 'add', label: 'Add screenshots' },
  { stage: 'check', label: 'Check' },
  { stage: 'matching', label: 'Match' },
  { stage: 'confirm', label: 'Confirm' }
];

@Component({
  selector: 'app-quick-start-closet-step',
  templateUrl: './closet-step.component.html',
  styleUrl: './closet-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    QuickStartStepNavComponent, ClosetAddComponent, ClosetCheckComponent, ClosetMatchingComponent, ClosetConfirmComponent,
    MusicPanelComponent, QuickStartEmotesComponent
  ]
})
export class ClosetStepComponent {
  readonly store = inject(QuickStartStore);
  readonly stages = STAGES;

  readonly active = computed(() => this.store.tabDef(this.store.activeTab()));
  readonly state = computed(() => this.store.tab(this.store.activeTab())());
  readonly stageIndex = computed(() => STAGES.findIndex(s => s.stage === this.state().stage));

  readonly rows = computed<Array<TabRow>>(() => {
    const status = this.store.status();
    return this.store.tabs.map(tab => {
      const s = this.store.tab(tab.key)();
      const { open, fresh } = status[tab.key];
      if (s.stage === 'confirm') {
        if (open) { return { tab, status: `${open} to check`, tone: 'warn' }; }
        // Emotes and music sheets open straight in the picker, so an empty one hasn't been looked at yet.
        if (!fresh && (tab.kind === 'music' || tab.kind === 'emote')) { return { tab, status: 'Not started', tone: 'plain' }; }
        return { tab, status: `${fresh} new`, tone: 'done' };
      }
      if (s.shots.length) {
        return { tab, status: `${s.shots.length} screenshot${s.shots.length === 1 ? '' : 's'}`, tone: 'plain' };
      }
      return { tab, status: 'Not added', tone: 'plain' };
    });
  });

  readonly anyNew = computed(() => Object.values(this.store.status()).some(s => s.fresh > 0));

  select(key: string): boolean {
    const current = this.store.activeTab();
    if (key === current) { return true; }
    if (!this.store.confirmUnsure([current])) { return false; }
    this.store.activeTab.set(key);
    return true;
  }

  forward(): void {
    if (!this.store.confirmUnsure(this.store.tabs.map(t => t.key))) { return; }
    this.store.step.update(s => s + 1);
  }

  /** Arrow keys move between tabs; the list is vertical on desktop and a horizontal strip on smaller screens. */
  onTabKeydown(event: KeyboardEvent): void {
    const tabs = this.store.tabs;
    const current = tabs.findIndex(t => t.key === this.store.activeTab());
    let next: number;
    switch (event.key) {
      case 'ArrowDown': case 'ArrowRight': next = (current + 1) % tabs.length; break;
      case 'ArrowUp': case 'ArrowLeft': next = (current - 1 + tabs.length) % tabs.length; break;
      case 'Home': next = 0; break;
      case 'End': next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    if (!this.select(tabs[next].key)) { return; }
    const buttons = (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]');
    buttons[next]?.focus();
  }
}
