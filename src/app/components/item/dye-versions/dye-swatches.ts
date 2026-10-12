import { DyeColor } from '@app/interfaces/dye.interface';
import { ItemDyeVersion } from '@app/services/item-dye-version.service';

/** In-game dye swatch colors. */
export const DYE_SWATCHES: Record<DyeColor, { color: string; blend: Record<DyeColor, string> }> = {
  red: { color: '#914944', blend: { red: '#8a342c', purple: '#995473', blue: '#996b97', cyan: '#8c7977', green: '#875533', yellow: '#ad714e', black: '#7d3c39', white: '#ab7574' } },
  purple: { color: '#ad7fac', blend: { red: '#8c6391', purple: '#ad7fac', blue: '#785282', cyan: '#a29ab2', green: '#9e8597', yellow: '#bd8f9f', black: '#80407d', white: '#b291b1' } },
  blue: { color: '#6f8fb2', blend: { red: '#7c7fa6', purple: '#766a91', blue: '#4d6d8f', cyan: '#4e7c9c', green: '#648b9c', yellow: '#689c93', black: '#425d7a', white: '#8393a6' } },
  cyan: { color: '#86bfbf', blend: { red: '#9395a3', purple: '#95adb8', blue: '#7ba8bd', cyan: '#53adad', green: '#449e92', yellow: '#6fb2ab', black: '#6d9494', white: '#a1c7c7' } },
  green: { color: '#839465', blend: { red: '#8f741d', purple: '#918c81', blue: '#679177', cyan: '#548c7d', green: '#617a37', yellow: '#899450', black: '#52692b', white: '#91a379' } },
  yellow: { color: '#baa065', blend: { red: '#cc8350', purple: '#b59682', blue: '#7fa358', cyan: '#bcbd84', green: '#aaab5c', yellow: '#ba8c16', black: '#8c7842', white: '#e8c67d' } },
  black: { color: '#595959', blend: { red: '#6b4442', purple: '#6e446c', blue: '#4a5766', cyan: '#427575', green: '#515c44', yellow: '#665529', black: '#2b2b2b', white: '#737373' } },
  white: { color: '#a6a6a6', blend: { red: '#bd8786', purple: '#bd9fbc', blue: '#9dadc2', cyan: '#b0c2c2', green: '#a5b593', yellow: '#dbc69e', black: '#8c8c8c', white: '#d9d9d9' } },
};

const UNDYED_SWATCH = '#4b4b4b';
const SLOT_SPLIT = '66.67%';

/** CSS background of the version circle, or undefined when no slot is dyed. */
export function versionSwatch(version: ItemDyeVersion | undefined, slotCount: number): string | undefined {
  const slots = version?.slice(0, slotCount) ?? [];
  if (!slots.some(d => d.primary)) { return undefined; }

  const [top, bottom = top] = slots.map(({ primary, secondary }) => {
    if (!primary) { return UNDYED_SWATCH; }
    return secondary ? DYE_SWATCHES[primary].blend[secondary] : DYE_SWATCHES[primary].color;
  });
  return `linear-gradient(to bottom, ${top} 0 ${SLOT_SPLIT}, ${bottom} ${SLOT_SPLIT} 100%)`;
}
