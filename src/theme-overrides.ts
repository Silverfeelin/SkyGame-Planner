/** Per-user tweaks layered on top of the selected theme preset. Numeric
 *  values are written as inline custom properties on <html>, which wins over
 *  the `:root[data-theme]` rules; the density preset is a data attribute
 *  so the stylesheet keeps the actual spacing values. */
export interface IThemeOverrides {
  hue?: number;
  chroma?: number;
  surface?: number;
  bgImage?: string;
  bgBrightness?: number;
  bgBlur?: number;
  vignette?: boolean;
  density?: string;
  menu?: string;
}

export type ThemeOverrideKey = keyof IThemeOverrides;
export type ThemeSliderKey = 'hue' | 'chroma' | 'surface' | 'bgBrightness' | 'bgBlur';

export interface IThemeSlider {
  key: ThemeSliderKey;
  name: string;
  min: number;
  max: number;
  step: number;
  cssVar: string;
  /** CSS unit appended to the written value. */
  unit?: string;
  /** Shown after the value in the UI when it differs from the CSS unit. */
  suffix?: string;
}

export const themeSliders: Array<IThemeSlider> = [
  { key: 'hue', name: 'Hue', min: 0, max: 360, step: 1, cssVar: '--atmos-hue', suffix: '°' },
  { key: 'chroma', name: 'Saturation', min: 0, max: 1.5, step: 0.05, cssVar: '--atmos-chroma' },
  { key: 'surface', name: 'Surface tone', min: -0.08, max: 0.12, step: 0.01, cssVar: '--atmos-surface-l' },
  { key: 'bgBrightness', name: 'Background brightness', min: 20, max: 120, step: 5, cssVar: '--atmos-bg-brightness', unit: '%' },
  { key: 'bgBlur', name: 'Background blur', min: 0, max: 20, step: 1, cssVar: '--atmos-bg-blur', unit: 'px' },
];

export interface INamedOption { name: string; value: string; }

/** Files under /assets/game/background. An empty value means the theme's own image. */
export const backgroundImages: Array<INamedOption> = [
  { name: 'Theme default', value: '' },
  { name: 'None', value: 'none' },
  { name: 'Isle of Dawn', value: 'isle' },
  { name: 'Aviary Village', value: 'aviary' },
  { name: 'Daylight Prairie', value: 'prairie' },
  { name: 'Prairie Peaks', value: 'peaks' },
  { name: 'Prairie Peaks (dusk)', value: 'peaks2' },
  { name: 'Hidden Forest', value: 'forest' },
  { name: 'Treasure Reef', value: 'reef' },
  { name: 'Village of Dreams', value: 'village' },
  { name: 'Concert Hall', value: 'concert_hall' },
  { name: 'Golden Wasteland', value: 'wasteland' },
  { name: 'Golden Wasteland (shipwreck)', value: 'wasteland2' },
  { name: 'Crescent Oasis', value: 'oasis' },
  { name: 'Vault of Knowledge', value: 'vault' },
  { name: 'Aurora', value: 'aurora' },
  { name: 'Nesting Workshop', value: 'nesting' },
  { name: 'Trials', value: 'trials' },
  { name: 'Void', value: 'void_jelly' },
  { name: 'Days of Bloom', value: 'bloom2024' },
  { name: 'Days of Color', value: 'color2024' },
  { name: 'Days of Feast 2023', value: 'feast2023' },
  { name: 'Days of Feast 2024', value: 'feast2024' },
  { name: 'Days of Fortune', value: 'fortune2024' },
  { name: 'Days of Love', value: 'love2024' },
  { name: 'Fireworks', value: 'firework' },
  { name: 'Moomin', value: 'moomin' },
  { name: 'Van Gogh', value: 'gogh' },
];

export const densityPresets: Array<INamedOption> = [
  { name: 'Comfortable', value: '' },
  { name: 'Compact', value: 'compact' },
];

export const menuPresets: Array<INamedOption> = [
  { name: 'Automatic', value: '' },
  { name: 'Always sidebar', value: 'desktop' },
];

const storageKey = 'theme.overrides';

export const getThemeOverrides = (): IThemeOverrides => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
};

export const hasThemeOverrides = (): boolean => Object.keys(getThemeOverrides()).length > 0;

export const loadThemeOverrides = (): void => {
  applyThemeOverrides(getThemeOverrides());
};

export const setThemeOverride = <K extends ThemeOverrideKey>(key: K, value: IThemeOverrides[K] | undefined): IThemeOverrides => {
  const overrides = getThemeOverrides();
  if (value === undefined || value === '') {
    delete overrides[key];
  } else {
    overrides[key] = value;
  }
  saveThemeOverrides(overrides);
  return overrides;
};

export const clearThemeOverrides = (): void => {
  saveThemeOverrides({});
};

/** Value currently in effect for a slider, whether from an override or the theme. */
export const getEffectiveSliderValue = (slider: IThemeSlider): number => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(slider.cssVar);
  const n = parseFloat(raw);
  return isNaN(n) ? slider.min : n;
};

const saveThemeOverrides = (overrides: IThemeOverrides): void => {
  if (Object.keys(overrides).length) {
    localStorage.setItem(storageKey, JSON.stringify(overrides));
  } else {
    localStorage.removeItem(storageKey);
  }
  applyThemeOverrides(overrides);
};

const applyThemeOverrides = (overrides: IThemeOverrides): void => {
  const root = document.documentElement;

  for (const slider of themeSliders) {
    const value = overrides[slider.key];
    if (value === undefined) {
      root.style.removeProperty(slider.cssVar);
    } else {
      root.style.setProperty(slider.cssVar, `${value}${slider.unit ?? ''}`);
    }
  }

  if (!overrides.bgImage) {
    root.style.removeProperty('--atmos-bg-image');
  } else if (overrides.bgImage === 'none') {
    root.style.setProperty('--atmos-bg-image', 'none');
  } else {
    root.style.setProperty('--atmos-bg-image', `url(/assets/game/background/${overrides.bgImage}.webp)`);
  }

  // Only "off" is stored; on means the theme's own vignette.
  if (overrides.vignette === false) {
    root.style.setProperty('--atmos-vignette-alpha', '0');
  } else {
    root.style.removeProperty('--atmos-vignette-alpha');
  }

  if (overrides.density) {
    root.setAttribute('data-density', overrides.density);
  } else {
    root.removeAttribute('data-density');
  }

  if (overrides.menu) {
    root.setAttribute('data-menu', overrides.menu);
  } else {
    root.removeAttribute('data-menu');
  }
};
