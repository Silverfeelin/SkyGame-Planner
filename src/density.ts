export interface IDensity {
  name: string;
  value: string;
}

export const densities: Array<IDensity> = [
  { name: 'Comfortable', value: '' },
  { name: 'Compact', value: 'compact' },
]

export const getCurrentDensity = (): IDensity => {
  const density = localStorage.getItem('density') || '';
  return densities.find(d => d.value === density) || densities[0];
}

export const loadDensity = (): void => {
  applyDensity(getCurrentDensity());
}

export const setDensity = (density: IDensity): void => {
  localStorage.setItem('density', density.value);
  applyDensity(density);
}

const applyDensity = (density: IDensity): void => {
  document.documentElement.setAttribute('data-density', density.value);
}
