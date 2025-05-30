export interface ITheme {
  name: string;
  value: string;
}

export const themes: Array<ITheme> = [
  { name: 'Default', value: '' },
  { name: 'Isle of Dawn', value: 'isle' },
  { name: 'Aviary Village', value: 'cozy' },
  { name: 'Prairie Peaks', value: 'peaks' },
  { name: 'Treasure Reef', value: 'reef' },
  { name: 'Village of Dreams', value: 'cold' },
  { name: 'Crescent Oasis', value: 'sandy' },
  { name: 'Days of Love', value: 'love' },
  { name: 'Moomin', value: 'moomin' },
  { name: 'Wonderland', value: 'wonderland' },
  { name: 'Void', value: 'dark' },
  { name: 'Compact', value: 'compact' },
  { name: 'Surprise', value: 'surprise' },
]

export const loadTheme = (): void => {
  const theme = localStorage.getItem('theme') || '';
  applyTheme(themes.find(t => t.value === theme) || themes[0]);
}

export const setTheme = (theme: ITheme): void => {
  localStorage.setItem('theme', theme.value);
  applyTheme(theme);
}

const getRandomTheme = (): ITheme => {
  return themes[Math.floor(Math.random() * (themes.length - 1))];
}

const applyTheme = (theme: ITheme): void => {
  const value = theme.value === 'surprise' ? getRandomTheme().value : theme.value;
  document.documentElement.setAttribute('data-theme', value);
}
