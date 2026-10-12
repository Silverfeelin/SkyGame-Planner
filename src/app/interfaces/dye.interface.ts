export type DyeColor = 'red' | 'purple' | 'blue' | 'cyan' | 'green' | 'yellow' | 'black' | 'white';
export const DYE_COLORS: DyeColor[] = ['red', 'purple', 'blue', 'cyan', 'green', 'yellow', 'black', 'white'];

/** The dyes blended into one dye slot of an item. */
export interface IDye {
  primary?: DyeColor;
  secondary?: DyeColor;
}
