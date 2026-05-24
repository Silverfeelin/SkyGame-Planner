
import { themeQuartz } from 'ag-grid-community';
import { getCurrentTheme } from 'src/themes';

const themeCache: { [key: string]: ReturnType<typeof createTheme> } = {};

/** Gets an AG Grid theme styled to the current website theme. */
export const getAgTheme = (): ReturnType<typeof createTheme> => {
  const currentTheme = getCurrentTheme();
  const cacheKey = currentTheme.value === 'surprise'
    ? (document.documentElement.getAttribute('data-theme') ?? '')
    : currentTheme.value;
  return themeCache[cacheKey] ?? createTheme(cacheKey);
}

const createTheme = (id: string): ReturnType<typeof themeQuartz.withParams> => {
  const docStyles = getComputedStyle(document.documentElement);
  const bodyStyles = getComputedStyle(document.body);
  const theme = themeQuartz.withParams({
    wrapperBorder: false,
    fontFamily: bodyStyles.getPropertyValue('font-family'),
    foregroundColor: docStyles.getPropertyValue('--color'),
    backgroundColor: docStyles.getPropertyValue('--color-background'),
    accentColor: docStyles.getPropertyValue('--color-link'),
    headerFontWeight: 'bold',
    headerBackgroundColor: docStyles.getPropertyValue('--color-card-header-background'),
    browserColorScheme: "dark",
    headerFontSize: 16
  });

  themeCache[id] = theme;
  return theme;
}

let atmosThemeCache: ReturnType<typeof themeQuartz.withParams> | undefined;

/** AG Grid theme matching the atmospheric (redesign) card style. */
export const getAtmosAgTheme = (): ReturnType<typeof themeQuartz.withParams> => {
  if (atmosThemeCache) return atmosThemeCache;

  const docStyles = getComputedStyle(document.documentElement);
  const bodyStyles = getComputedStyle(document.body);
  const v = (name: string) => docStyles.getPropertyValue(name).trim();

  atmosThemeCache = themeQuartz.withParams({
    wrapperBorder: false,
    fontFamily: bodyStyles.getPropertyValue('font-family'),
    browserColorScheme: 'dark',
    foregroundColor: v('--atmos-text'),
    headerTextColor: v('--atmos-text'),
    backgroundColor: 'transparent',
    oddRowBackgroundColor: 'transparent',
    rowHoverColor: v('--atmos-hover-bg'),
    headerBackgroundColor: v('--atmos-card-bg'),
    headerFontWeight: 'bold',
    headerFontSize: 16,
    borderColor: v('--atmos-line-soft'),
    accentColor: v('--atmos-accent'),
  });

  return atmosThemeCache;
};
