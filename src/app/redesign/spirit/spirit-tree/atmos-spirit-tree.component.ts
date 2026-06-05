import { ChangeDetectionStrategy, Component, computed, input, output, TemplateRef } from '@angular/core';
import { AtmosNodeAction, AtmosNodeComponent } from '../node/atmos-node.component';
import { CostComponent } from '@app/components/util/cost/cost.component';
import { TreeHelper } from '@app/helpers/tree-helper';
import { CostHelper } from '@app/helpers/cost-helper';
import { INode, ISpiritTree, ISpiritTreeTier, ICost } from 'skygame-data';

export interface AtmosSpiritTreeNodeClickEvent {
  node: INode;
  event: MouseEvent;
}

interface AtmosTreeRow {
  left?: INode;
  center?: INode;
  right?: INode;
}

/**
 * Atmospheric spirit-tree renderer. Lays the tree out as a vertical stack of
 * 3-column rows, delegating each node to `AtmosNodeComponent`.
 *
 * Mirrors the legacy `SpiritTreeComponent` input surface; unlock/lock/keyboard
 * shortcuts remain in legacy until pages adopt this widget.
 */
@Component({
  selector: 'app-atmos-spirit-tree',
  templateUrl: './atmos-spirit-tree.component.html',
  styleUrl: './atmos-spirit-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmosNodeComponent, CostComponent]
})
export class AtmosSpiritTreeComponent {
  readonly tree = input.required<ISpiritTree>();
  readonly name = input<string | undefined>(undefined);
  readonly highlight = input<boolean>(false);
  readonly highlightItem = input<string | ReadonlyArray<string> | undefined>(undefined);
  readonly highlightNode = input<string | ReadonlyArray<string> | undefined>(undefined);
  readonly enableControls = input<boolean>(true);
  readonly enableNavigation = input<boolean>(true);
  readonly showNodeTooltips = input<boolean>(true);
  readonly opaqueNodes = input<boolean | ReadonlyArray<string> | undefined>(undefined);
  readonly padBottom = input<boolean>(false);
  readonly forceNodeAction = input<AtmosNodeAction | undefined>(undefined);
  readonly nodeOverlayTemplate = input<TemplateRef<unknown> | undefined>(undefined);

  readonly nodeClicked = output<AtmosSpiritTreeNodeClickEvent>();

  readonly visibleName = computed<string | undefined>(() => {
    const t = this.tree();
    return this.name()
      ?? t.name
      ?? t.eventInstanceSpirit?.name
      ?? t.eventInstanceSpirit?.spirit?.name
      ?? t.travelingSpirit?.spirit?.name
      ?? t.specialVisitSpirit?.spirit?.name
      ?? t.spirit?.name;
  });

  readonly rows = computed<ReadonlyArray<AtmosTreeRow>>(() => {
    const t = this.tree();
    const rows: AtmosTreeRow[] = [];

    if (t.node) {
      // Walk the node chain bottom (root) → top.
      const buildRows = (n: INode, dir: number, level: number) => {
        const row = rows[level] ?? (rows[level] = {});
        if (dir < 0) { row.left = n; }
        else if (dir > 0) { row.right = n; }
        else { row.center = n; }
        if (n.nw) { buildRows(n.nw, dir - 1, level); }
        if (n.ne) { buildRows(n.ne, dir + 1, level); }
        if (n.n) { buildRows(n.n, dir, level + 1); }
      };
      buildRows(t.node, 0, 0);
      // Reverse so the root is at the bottom visually.
      return rows.slice().reverse();
    } else if (t.tier) {
      let level = -1;
      const tiers = TreeHelper.getTiers(t);
      for (const tier of tiers) {
        for (const tierRow of tier.rows) {
          level++;
          const row: AtmosTreeRow = {};
          row.left = tierRow[0] ?? undefined;
          row.center = tierRow[1] ?? undefined;
          row.right = tierRow[2] ?? undefined;
          rows[level] = row;
        }
      }
      return rows.slice().reverse();
    }

    return rows;
  });

  readonly action = computed<AtmosNodeAction>(() => this.forceNodeAction() ?? 'unlock');

  private readonly opaqueMap = computed<Set<string>>(() => {
    const o = this.opaqueNodes();
    const set = new Set<string>();
    if (Array.isArray(o)) { o.forEach(g => set.add(g)); }
    return set;
  });

  readonly opaqueAll = computed<boolean>(() => this.opaqueNodes() === true);

  private readonly highlightItemSet = computed<Set<string>>(() => {
    const h = this.highlightItem();
    const set = new Set<string>();
    if (typeof h === 'string') { set.add(h); }
    else if (Array.isArray(h)) { h.forEach(g => set.add(g)); }
    return set;
  });

  private readonly highlightNodeSet = computed<Set<string>>(() => {
    const h = this.highlightNode();
    const set = new Set<string>();
    if (typeof h === 'string') { set.add(h); }
    else if (Array.isArray(h)) { h.forEach(g => set.add(g)); }
    return set;
  });

  readonly totalCost = computed<ICost>(() => {
    return CostHelper.add(CostHelper.create(), ...TreeHelper.getNodes(this.tree()));
  });

  readonly remainingCost = computed<ICost>(() => {
    const locked = TreeHelper.getNodes(this.tree()).filter(n => !n.unlocked && !n.item?.unlocked);
    return CostHelper.add(CostHelper.create(), ...locked);
  });

  isNodeOpaque(node: INode): boolean {
    return this.opaqueAll() || this.opaqueMap().has(node.guid);
  }

  isNodeHighlighted(node: INode): boolean {
    if (this.highlightNodeSet().has(node.guid)) { return true; }
    if (node.item && this.highlightItemSet().has(node.item.guid)) { return true; }
    return false;
  }

  onNodeClicked(event: MouseEvent, node: INode): void {
    this.nodeClicked.emit({ node, event });
  }
}
