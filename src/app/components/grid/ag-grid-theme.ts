
import { themeQuartz } from 'ag-grid-community';

/** Gets an AG Grid theme styled to the current website theme. */
export const getAgTheme = (): ReturnType<typeof themeQuartz.withParams> => {
  return createTheme();
}

const createTheme = (): ReturnType<typeof themeQuartz.withParams> => {
  const docStyles = getComputedStyle(document.documentElement);
  const bodyStyles = getComputedStyle(document.body);
  return themeQuartz.withParams({
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
}

/** AG Grid theme matching the atmospheric (redesign) card style. */
export const getAtmosAgTheme = (): ReturnType<typeof themeQuartz.withParams> => {
  const docStyles = getComputedStyle(document.documentElement);
  const bodyStyles = getComputedStyle(document.body);
  const v = (name: string) => docStyles.getPropertyValue(name).trim();

  return themeQuartz.withParams({
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
    menuBackgroundColor: v('--atmos-card-bg-solid'),
  });
};
