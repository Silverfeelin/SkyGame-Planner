import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MatIcon]
})
export class CardComponent implements AfterViewInit {
  @Input() title?: string;
  @Input() foldable = false;
  @Input() folded = false;
  @Input() lazy = false;
  loaded = false;

  /** Event that fires whenever the user clicks a foldable card header. */
  @Output() beforeFold = new EventEmitter<boolean>();
  /** Event that fires only after the fold animation completely finishes. */
  @Output() afterFold = new EventEmitter<boolean>();

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
    this.loaded = true;

    this.beforeFold.emit(this.folded);

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
    this._interval = window.setTimeout(() => {
      if (!this.folded) { this.body.nativeElement.style.height = ''; }
      this.afterFold.emit(this.folded);
    }, 300);
  }
}
