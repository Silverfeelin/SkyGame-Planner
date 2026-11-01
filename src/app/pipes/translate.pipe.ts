import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '@app/services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly _translationService = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    if (!key) { return ''; }
    let value = this._translationService.getNested<string>(key) || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    
    return value;
  }
}
