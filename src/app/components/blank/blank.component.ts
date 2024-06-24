import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-blank',
    template: '',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class BlankComponent {}
