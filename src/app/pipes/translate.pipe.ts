import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '@app/services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true
})
export class TranslatePipe implements PipeTransform {
  private readonly _translationService = inject(TranslationService);

  transform(key: string): string {
    if (!key) { return ''; }
    return this._translationService.getNested<string>(key) || key;
  }
}
