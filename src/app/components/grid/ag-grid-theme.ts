
import { Theme, themeQuartz } from '@ag-grid-community/theming';
import { getCurrentTheme } from 'src/themes';

const themeCache: { [key: string]: Theme<unknown> } = {};

/** Gets an AG Grid theme styled to the current website theme. */
export const getAgTheme = (): Theme<unknown> => {
  const currentTheme = getCurrentTheme();
  return themeCache[currentTheme.value]
    ?? createTheme(currentTheme.value);
}

const createTheme = (id: string): Theme<unknown> => {
  const docStyles = getComputedStyle(document.documentElement);
  const bodyStyles = getComputedStyle(document.body);
  const theme = themeQuartz.withParams({
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
