import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ClosetSketchKind = 'tab' | 'whole' | 'scroll';

interface SketchTile {
  x: number;
  y: number;
  height: number;
  cut: boolean;
}

const PANEL_X = 80;
const PANEL_W = 88;
const CENTER_X = PANEL_X + PANEL_W / 2;

/** Sketch of the game's closet: a panel on the right with centred category tabs above a five-column grid. */
@Component({
  selector: 'app-quick-start-closet-sketch',
  templateUrl: './closet-sketch.component.html',
  styleUrl: './closet-sketch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClosetSketchComponent {
  readonly kind = input.required<ClosetSketchKind>();

  readonly panelX = PANEL_X;
  readonly panelW = PANEL_W;
  readonly panelShift = `translate(${-PANEL_X} 0)`;
  readonly categoryTabs = [-1, 0, 1].map(k => ({ k, x: CENTER_X + k * 20 - 6 }));

  readonly tiles = computed<Array<SketchTile>>(() => {
    // The 'scroll' sketch shows a fourth row cut off at the bottom edge.
    const rows = this.kind() === 'scroll' ? 4 : 3;
    const tiles: Array<SketchTile> = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 5; c++) {
        const cut = r === 3;
        tiles.push({ x: PANEL_X + 7 + c * 15.5, y: 20 + r * 16, height: cut ? 6 : 12, cut });
      }
    }
    return tiles;
  });
}
