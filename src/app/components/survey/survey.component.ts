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
    const now = DateTime.now().toSeconds();
    this.visible = !date || now > date;
  }

  remind(): void {
    this.visible = false;
    localStorage.setItem('survey.hide', DateTime.now().plus({days: 1}).toSeconds().toFixed(0));
  }

  close(): void {
    this.visible = false;
    localStorage.setItem('survey.hide', DateTime.now().plus({months: 1}).toSeconds().toFixed(0));
  }
}
