import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
  });

  it('should be created with default language "en"', () => {
    expect(service).toBeTruthy();
    expect(service.currentLanguage()).toBe('en');
  });

  it('should change language to "vi"', () => {
    service.setLanguage('vi');
    expect(service.currentLanguage()).toBe('vi');
    expect(localStorage.getItem('setting.language')).toBe('vi');
  });

  it('should retrieve nested translations correctly for "en"', () => {
    service.setLanguage('en');
    const settings = service.getNested('SETTINGS') as { TITLE: string };
    expect(settings.TITLE).toBe('Settings');
  });

  it('should retrieve nested translations correctly for "vi"', () => {
    service.setLanguage('vi');
    const settings = service.getNested('SETTINGS') as { TITLE: string };
    expect(settings.TITLE).toBe('Cài đặt');
  });
});
