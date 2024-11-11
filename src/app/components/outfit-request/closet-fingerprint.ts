import { ItemType } from '@app/interfaces/item.interface';

const borderSize = 1;
const tileSize = 3;
const length = [
  ItemType.Outfit, ItemType.Shoes,
  ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
  ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
  ItemType.Cape, ItemType.Prop
].length;

const defaultColor = '#222';
const colors = [
  '#FF6666', '#FF0000', '#990000',
  '#FFB366', '#FF8000', '#994C00',
  '#FFFF66', '#FFFF00', '#999900',
  '#B3FF66', '#80FF00', '#4C9900',
  '#66FF66', '#00FF00', '#009900',
  '#66FFB3', '#00FF80', '#00994C',
  '#66FFFF', '#00FFFF', '#009999',
  '#66B3FF', '#0080FF', '#004C99',
  '#6666FF', '#0000FF', '#000099',
  '#B366FF', '#8000FF', '#4C0099',
  '#FF66FF', '#FF00FF', '#990099',
  '#FF66B3', '#FF0080', '#99004C',
];
const colorValues = [...colors, defaultColor].map(color => {
  const value = parseInt(color.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
});

const findNearestColor = (r: number, g: number, b: number): number => {
  let minDistance = Infinity;
  let nearestColorIndex = -1;

  colorValues.forEach((color, index) => {
    const [cr, cg, cb] = color;
    const distance = Math.sqrt(
      Math.pow(r - cr, 2) +
      Math.pow(g - cg, 2) +
      Math.pow(b - cb, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestColorIndex = index;
    }
  });

  return nearestColorIndex;
};

export const drawFingerprint = (ctx: CanvasRenderingContext2D, position: [number, number], itemIds: Array<number>): void => {
  ctx.save();
  const cItems = itemIds.map(id => id.toString(36).padStart(3, '0').split('').map(s => parseInt(s, 36)));

  const width = tileSize * itemIds.length + borderSize * 2;
  const height = tileSize * 3 + borderSize * 2;

  // Draw border
  ctx.fillStyle = '#000000';
  ctx.fillRect(position[0], position[1] - height, width, height);

  let x = position[0] + borderSize;
  let y = position[1] - borderSize - tileSize * 3;

  cItems.forEach(ci => {
    const useColor = ci.some(c => c);
    ctx.fillStyle = useColor ? colors[ci[0]] : defaultColor;
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.fillStyle = useColor ? colors[ci[1]] : defaultColor;
    ctx.fillRect(x, y + tileSize, tileSize, tileSize);
    ctx.fillStyle = useColor ? colors[ci[2]] : defaultColor;
    ctx.fillRect(x, y + tileSize + tileSize, tileSize, tileSize);

    x += tileSize;
  });

  ctx.restore();
};

export const readFingerprint = (ctx: CanvasRenderingContext2D, position: [number, number]): Array<number> => {
  const itemIds: number[] = [];

  for (let ix = 0; ix < length; ix++) {
    const indices: number[] = [];
    for (let iy = 0; iy < 3; iy++) {
      const x = position[0] + ix * tileSize + borderSize;
      const y = position[1] - tileSize * 3 + iy * tileSize + borderSize;
      const pixelData = ctx.getImageData(x, y, 3, 3);
      const avgR = (pixelData.data[0] + pixelData.data[4] + pixelData.data[8]) / 3;
      const avgG = (pixelData.data[1] + pixelData.data[5] + pixelData.data[9]) / 3;
      const avgB = (pixelData.data[2] + pixelData.data[6] + pixelData.data[10]) / 3;

      const nearestColorIndex = findNearestColor(avgR, avgG, avgB);
      indices.push(nearestColorIndex === colorValues.length - 1  ? 0 : nearestColorIndex);
    }

    const itemId = parseInt(indices.map(i => i.toString(36)).join(''), 36);
    itemIds.push(itemId);
  }

  return itemIds;
};
