import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './survey.component.html',
  styleUrl: './survey.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SurveyComponent {
  visible = true;

  constructor() {
    const date = +(localStorage.getItem('survey.hide') || '') || 0;
    this.visible = !!date;
  }

  close(): void {
    localStorage.removeItem('survey.hide');
    this.visible = false;
  }
}
