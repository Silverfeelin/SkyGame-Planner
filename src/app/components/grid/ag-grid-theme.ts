
import { themeQuartz } from 'ag-grid-community';

/** Gets an AG Grid theme styled to match the site's card style. */
export const getAgTheme = (): ReturnType<typeof themeQuartz.withParams> => {
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
    pickerListBackgroundColor: v('--atmos-card-bg-solid'),
  });
};
