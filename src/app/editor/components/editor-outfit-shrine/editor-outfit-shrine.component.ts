import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, viewChild } from '@angular/core';
import { ItemHelper } from '@app/helpers/item-helper';
import { DataService } from '@app/services/data.service';
import { ItemType, IItem } from 'skygame-data';

const imageMap: { [key: string]: HTMLImageElement } = {};
const loadImage = (url: string): Promise<HTMLImageElement> => (new Promise((resolve, reject) => {
  // Use cache.
  if (imageMap[url]) { resolve(imageMap[url]); return; }

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.addEventListener('load', () => {
    imageMap[url] = image;
    resolve(image);
  });
  image.onerror = err => { reject(err); }
  image.src = url;
}));

@Component({
    selector: 'app-editor-outfit-shrine',
    imports: [],
    templateUrl: './editor-outfit-shrine.component.html',
    styleUrl: './editor-outfit-shrine.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorOutfitShrineComponent implements AfterViewInit {
  @ViewChild('inpSubtitle', { static: true }) inpSubtitle!: ElementRef<HTMLTextAreaElement>;

  itemsPerRow = 17;
  sheets = [
    {
      types: [
        { type: ItemType.Outfit, label: 'Outfits', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3d/Sky-Closet-Pants-Morybel-0146.png' },
        { type: ItemType.Shoes, label: 'Shoes', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3d/Sky-Closet-Pants-Morybel-0146.png' },
        { type: ItemType.Mask, label: 'Masks', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c6/Sky-Closet-Masks-Morybel-0146.png' },
        { type: ItemType.FaceAccessory, label: 'Face Accessories', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c6/Sky-Closet-Masks-Morybel-0146.png' },
        { type: ItemType.Necklace, label: 'Pendants', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c6/Sky-Closet-Masks-Morybel-0146.png' }
      ]
    },
    {
      types: [
        { type: ItemType.Hair, label: 'Hairs', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b8/Sky-Closet-Hairstyles-Morybel-0146.png' },
        { type: ItemType.HairAccessory, label: 'Hair Accessories', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b8/Sky-Closet-Hairstyles-Morybel-0146.png' },
        { type: ItemType.HeadAccessory, label: 'Head Accessories', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b8/Sky-Closet-Hairstyles-Morybel-0146.png' },
        { type: ItemType.Cape, label: 'Capes', closetImageHeight: 99, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/67/Sky-Closet-Capes-Morybel-0146.png' }
      ]
    },
    {
      types: [
        { type: ItemType.Held, label: 'Held Props', closetImageHeight: 50, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/22/Sky-Closet-accessories-Morybel-0146.png' },
        { type: ItemType.Furniture, label: 'Large Placeable Props', closetImageHeight: 50, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/22/Sky-Closet-accessories-Morybel-0146.png' },
        { type: ItemType.Prop, label: 'Small Placeable Props', closetImageHeight: 50, closetImage: 'https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/22/Sky-Closet-accessories-Morybel-0146.png' }
      ]
    }
  ];

  constructor(
    private readonly _dataService: DataService,
  ) {
    document.head.insertAdjacentHTML('beforeend', '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap">');

  }

  ngAfterViewInit(): void {

  }

  async generateSheet(i: number): Promise<void> {
    const sheet = this.sheets[i];
    if (!sheet) return;

    const itemsByType: { [key in ItemType]: IItem[] } = {} as any;
    for (const type in ItemType) {
      itemsByType[type as ItemType] = [];
    }

    this._dataService.itemConfig.items.forEach(item => {
      itemsByType[item.type].push(item);
    });

    for (const type in itemsByType) {
      itemsByType[type as ItemType].sort(ItemHelper.sorter);
    }

    let rows = sheet.types.reduce((acc, { type }) => {
      const items = itemsByType[type];
      return acc + Math.ceil(items.length / this.itemsPerRow);
    }, 0);

    const canvas = document.createElement('canvas');
    canvas.width = 1275;
    canvas.height = rows * 64 + sheet.types.length * 64 + 400;
    const ctx = canvas.getContext('2d')!;

    // Draw BG
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw header
    const logoImg = await loadImage('/assets/game/sky_logo.webp');
    const logoImgSize = [ 366 / 3, 441 / 3 ];
    const logoText = 'Outfit Shrine';
    ctx.font = `600 64px "Dancing Script", cursive`;
    const logoTextWidth = ctx.measureText(logoText).width;
    const logoHeight = 64;
    ctx.fillStyle = '#393939';
    const totalWidth = logoImgSize[0] + logoTextWidth;
    const startX = (canvas.width - totalWidth) / 2;
    const logoY = 32;
    ctx.drawImage(logoImg, startX, logoY, logoImgSize[0], logoImgSize[1]);
    const logoX = startX + logoImgSize[0];
    ctx.fillText(logoText, logoX, logoY + logoHeight + 20);

    const subtitle = this.inpSubtitle.nativeElement.value;
    if (subtitle) {
      ctx.font = '14px Roboto';
      const lines = subtitle.split('\n');
      lines.forEach((line, i) => {
        const lineWidth = ctx.measureText(line).width;
        ctx.fillText(line, (canvas.width - lineWidth) / 2 + 100, logoY + logoHeight + 44 + i * 18);
      });
    }

    const rowWidth = 64 * this.itemsPerRow;
    let x = (canvas.width - rowWidth) / 2;
    let y = 200;

    for (const { type, label, closetImage, closetImageHeight } of sheet.types) {
      const closetImg = await loadImage(closetImage);
      ctx.drawImage(closetImg, x - 60, y - 20, 50, closetImageHeight);

      ctx.font = '24px Roboto';
      ctx.fillText(label, x, y);

      // Draw line
      ctx.beginPath();
      ctx.moveTo(x, y + 10);
      ctx.lineTo(x + rowWidth, y + 10);
      ctx.strokeStyle = '#0008';
      ctx.stroke();
      y += 20;

      const items = itemsByType[type];
      let dx = 0;
      let dy = 0;

      const iconPromises = items.map(item => item.icon ? loadImage(item.icon) : Promise.resolve(null));
      const icons = await Promise.all(iconPromises);
      icons.forEach((icon, i) => {
        if (icon) {
          ctx.drawImage(icon, x + dx * 64, y + dy * 64, 64, 64);
        }
        dx++;
        if (dx >= this.itemsPerRow) { dx = 0; dy++; }
      });

      y += Math.ceil(items.length / this.itemsPerRow) * 64 + 64;
    }

    ctx.save();
    const footerText = [
      'Most vectors in this file are by Morybel and Ray808080 on the Sky: CotL Wiki',
      'Find more contributors at https://sky-children-of-the-light.fandom.com/wiki/Special:Community',
      'Generated using https://sky-planner.com',
      'This image is not affiliated with thatgamecompany',
    ];
    ctx.font = '16px Roboto';
    ctx.fillStyle = '#393939';
    const footerTextWidth1 = ctx.measureText(footerText[0]).width;
    const footerTextWidth2 = ctx.measureText(footerText[1]).width;
    const footerTextWidth3 = ctx.measureText(footerText[2]).width;
    const footerTextWidth4 = ctx.measureText(footerText[3]).width;
    ctx.fillText(footerText[0], 12, canvas.height - 36);
    ctx.fillText(footerText[1], 12, canvas.height - 12);
    ctx.textAlign = 'right';
    ctx.fillText(footerText[2], canvas.width - 12, canvas.height - 36);
    ctx.fillText(footerText[3], canvas.width - 12, canvas.height - 12);
    ctx.restore();

    canvas.id = 'outfit-shrine';
    document.getElementById('outfit-shrine')?.remove();
    document.getElementById('outfit-shrine-output')?.appendChild(canvas);
  }
}
