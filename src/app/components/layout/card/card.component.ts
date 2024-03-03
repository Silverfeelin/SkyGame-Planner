import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements AfterViewInit {
  @Input() title?: string;
  @Input() foldable = false;
  @Input() folded = false;

  @ViewChild('body', { static: true }) body!: ElementRef<HTMLDivElement>;

  private _interval?: number;

  ngAfterViewInit(): void {
    if (this.folded) {
      this.body.nativeElement.style.height = '0px';
    }
  }

  unfold(): void {
    if (!this.foldable || !this.folded) { return; }
    this.toggleFold();
  }

  toggleFold(): void {
    if (!this.foldable) { return; }
    this.folded = !this.folded;

    // Set height to transition to 0.
    if (this.folded) {
      this.body.nativeElement.style.height = this.body.nativeElement.scrollHeight + 'px';
    }
    // Start transition.
    setTimeout(() => {
      this.body.nativeElement.style.height = this.folded ? '0px' : this.body.nativeElement.scrollHeight + 'px';
    });

    // Remove height after transition.
    clearTimeout(this._interval);
    if (!this.folded) {
      this._interval = window.setTimeout(() => {
        this.body.nativeElement.style.height = '';
      }, 300);
    }
  }
}
