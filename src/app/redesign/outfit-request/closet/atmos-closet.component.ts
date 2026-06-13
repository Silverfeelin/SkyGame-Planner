import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { DataService } from '@app/services/data.service';
import { IconService } from '@app/services/icon.service';
import { ItemHelper } from '@app/helpers/item-helper';
import { TreeHelper } from '@app/helpers/tree-helper';
import { DateHelper } from '@app/helpers/date-helper';
import { IItem, ItemType, ItemSize } from 'skygame-data';
import { ClosetStateService, RequestColor } from './closet-state.service';
import { ClosetSerializer, IOutfitRequest } from './closet-serializer';
import { ClosetRenderer, CopyImageMode } from './closet-renderer';
import { AtmosClosetToolbarComponent } from './atmos-closet-toolbar.component';
import { AtmosClosetGridComponent } from './atmos-closet-grid.component';
import { AtmosClosetDyePickerComponent } from './atmos-closet-dye-picker.component';
import { AtmosClosetBackgroundPickerComponent } from './atmos-closet-background-picker.component';
import { AtmosClosetModifyPanelComponent } from './atmos-closet-modify-panel.component';
import { IOutfitRequestBackground, IOutfitRequestBackgrounds } from '@app/interfaces/outfit-request.interface';
import { drawFingerprint } from '@app/redesign/outfit-request/closet-fingerprint';

type DyeColor = 'red' | 'purple' | 'blue' | 'cyan' | 'green' | 'yellow' | 'black' | 'white';
const DYE_COLORS: DyeColor[] = ['red', 'purple', 'blue', 'cyan', 'green', 'yellow', 'black', 'white'];

@Component({
  selector: 'app-atmos-closet',
  templateUrl: './atmos-closet.component.html',
  styleUrl: './atmos-closet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [ClosetStateService],
  imports: [
    RouterLink, MatIcon,
    AtmosClosetToolbarComponent,
    AtmosClosetGridComponent,
    AtmosClosetDyePickerComponent,
    AtmosClosetBackgroundPickerComponent,
    AtmosClosetModifyPanelComponent
  ]
})
export class AtmosClosetComponent implements OnDestroy {
  readonly state = inject(ClosetStateService);
  private readonly _data = inject(DataService);
  private readonly _iconService = inject(IconService);
  private readonly _matIconRegistry = inject(MatIconRegistry);
  private readonly _http = inject(HttpClient);
  private readonly _route = inject(ActivatedRoute);
  private readonly _el = inject(ElementRef<HTMLElement>);

  // Canvas rendering
  private _bgImg!: HTMLImageElement;
  bgAttribution?: string;
  bgFilter?: string;

  private _imgNone = new Image();
  private _imgUnknown = new Image();
  private _imgSheets: Record<string, HTMLImageElement> = {};
  private _svgDyes: Record<string, SVGElement> = {};

  private _serializer!: ClosetSerializer;
  private _bgListener: ((e: Event) => void) | null = null;

  // Mode from route data (closet mode host only shows closet; request mode shows both)
  readonly requesting = false;

  readonly backgroundSections: IOutfitRequestBackgrounds[];
  private readonly _backgroundSectionMap: Record<string, IOutfitRequestBackgrounds> = {};
  private readonly _backgroundMap: Record<string, IOutfitRequestBackground> = {};

  constructor() {
    // Load images
    this._bgImg = new Image();
    this._bgImg.crossOrigin = 'anonymous';
    this._imgNone.src = '/assets/icons/none.webp';
    this._imgUnknown.src = '/assets/icons/question.webp';

    this._iconService.getSheets().forEach(sheet => {
      const img = new Image();
      img.src = `/assets/game/${sheet}`;
      this._imgSheets[sheet] = img;
    });

    // Load dye SVGs
    ['none', ...DYE_COLORS].forEach(d => {
      this._matIconRegistry.getNamedSvgIcon(`dye-${d}`).subscribe(svg => {
        this._svgDyes[d] = svg;
      });
    });

    // Init background
    this.backgroundSections = Object.values(this._data.outfitRequestConfig.backgrounds);
    let defaultBg: string | undefined;
    for (const section of this.backgroundSections) {
      this._backgroundSectionMap[section.guid] = section;
      if (!defaultBg && section.default) { defaultBg = section.guid; }
      for (const bg of section.backgrounds) {
        this._backgroundMap[bg.guid] = bg;
        if (!defaultBg && bg.default) { defaultBg = bg.guid; }
      }
    }

    let bgGuid = localStorage.getItem('closet.background') || '';
    if (!this._backgroundMap[bgGuid] && !this._backgroundSectionMap[bgGuid]) {
      bgGuid = defaultBg || Object.values(this._backgroundMap).at(0)!.guid;
    }
    this._applyBackground(bgGuid);

    // Listen for background changes from picker
    this._bgListener = (e: Event) => {
      const bg = (e as CustomEvent).detail as IOutfitRequestBackground;
      this._bgImg.src = bg.url;
      this.bgAttribution = bg.section?.attribution || '';
      this.bgFilter = bg.filter;
    };
    document.addEventListener('atmos-bg-change', this._bgListener);

    // Initialize items and selection
    this._initItems();
  }

  ngOnDestroy(): void {
    if (this._bgListener) {
      document.removeEventListener('atmos-bg-change', this._bgListener);
    }
  }

  // ── Background ────────────────────────────────────────────────────────────

  private _applyBackground(guid: string): void {
    const bg = this._backgroundMap[guid];
    const section = this._backgroundSectionMap[guid];
    const resolved = bg
      ? bg
      : section
        ? section.backgrounds[Math.floor(Math.random() * section.backgrounds.length)]
        : Object.values(this._backgroundMap).at(0);

    if (!resolved) { return; }
    this._bgImg.src = resolved.url;
    this.bgAttribution = resolved.section?.attribution || '';
    this.bgFilter = resolved.filter;
  }

  // ── Items ────────────────────────────────────────────────────────────────

  private _initItems(): void {
    const state = this.state;

    const itemTypeUnequip: Record<string, number> = [
      ItemType.Necklace, ItemType.HairAccessory, ItemType.HeadAccessory,
      ItemType.Held, ItemType.Shoes, ItemType.FaceAccessory
    ].reduce((m, t, i) => (m[`${t}`] = 46655 - i, m), {} as Record<string, number>);

    const itemTypes: ItemType[] = [
      ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
      ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
      ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
      ItemType.Cape, ItemType.Held, ItemType.Furniture, ItemType.Prop
    ];

    const items: Partial<Record<string, IItem[]>> = {};
    const allItems: IItem[] = [];
    const itemMap: Record<string, IItem> = {};

    for (const type of itemTypes) {
      items[type as string] = [];
      const unequipId = itemTypeUnequip[type];
      if (unequipId) {
        const placeholder: IItem = {
          id: unequipId,
          guid: type.substring(0, 10).padStart(10, '_'),
          name: 'None',
          icon: 'assets/icons/none.webp',
          type,
          unlocked: true,
          order: -1
        };
        items[type as string]!.push(placeholder);
        allItems.push(placeholder);
        itemMap[placeholder.guid] = placeholder;
      }
    }

    // Ongoing items
    const ongoingItems: Record<string, IItem> = {};
    const regularSpirits = this._data.spiritConfig.items.filter(s => s.type === 'Regular' || s.type === 'Elder');
    regularSpirits.forEach(spirit => TreeHelper.getItems(spirit.tree).forEach(item => ongoingItems[item.guid] = item));

    const season = DateHelper.getActive(this._data.seasonConfig.items);
    season?.spirits?.forEach(spirit => TreeHelper.getItems(spirit.tree).forEach(item => ongoingItems[item.guid] = item));
    season?.shops?.forEach(shop => {
      shop.iaps?.forEach(iap => iap.items?.forEach(item => ongoingItems[item.guid] = item));
      shop.itemList?.items?.forEach(node => ongoingItems[node.item.guid] = node.item);
    });
    this._data.eventConfig.items.forEach(event => {
      const instance = DateHelper.getActive(event.instances);
      instance?.spirits?.forEach(spirit => TreeHelper.getItems(spirit.tree).forEach(item => ongoingItems[item.guid] = item));
      instance?.shops?.forEach(shop => {
        shop.iaps?.forEach(iap => iap.items?.forEach(item => ongoingItems[item.guid] = item));
        shop.itemList?.items?.forEach(node => ongoingItems[node.item.guid] = node.item);
      });
    });
    TreeHelper.getItems(DateHelper.getActive(this._data.travelingSpiritConfig.items)?.tree)
      .forEach(item => ongoingItems[item.guid] = item);
    DateHelper.getActive(this._data.returningSpiritsConfig.items)?.spirits?.forEach(spirit =>
      TreeHelper.getItems(spirit.tree).forEach(item => ongoingItems[item.guid] = item)
    );

    // Add all catalog items
    for (const item of this._data.itemConfig.items) {
      if (item.closetHide) { continue; }
      if (!items[item.type as string]) { continue; }
      items[item.type as string]!.push(item);
      allItems.push(item);
      itemMap[item.guid] = item;
    }

    for (const type of itemTypes) {
      ItemHelper.sortItems(items[type as string]!);
    }

    state.allItems.set(allItems);
    state.itemMap.set(itemMap);
    state.items.set(items);
    state.ongoingItems.set(ongoingItems);

    this._serializer = new ClosetSerializer(this._http, allItems);

    if (state.shouldSync()) { this._syncUnlocked(); }

    const qp = this._route.snapshot.queryParamMap;
    if (qp.has('k')) {
      this._loadFromKV(qp.get('k')!);
    } else {
      this._loadFromObj({
        a: qp.get('a') || '',
        r: qp.get('r') || '',
        y: qp.get('y') || '',
        g: qp.get('g') || '',
        b: qp.get('b') || '',
        d: qp.get('d') || ''
      });
    }
  }

  private _syncUnlocked(): void {
    const hidden: Record<string, boolean> = {};
    for (const item of this.state.allItems()) {
      if (!item.unlocked) { hidden[item.guid] = true; }
    }
    this.state.hidden.set(hidden);
    this.state.lastLink.set(undefined);
    this.state.persistHidden();
  }

  private async _loadFromKV(key: string): Promise<void> {
    const data = await this._serializer.loadFromKV(key);
    if (!data) { alert('This link is invalid or has expired.'); return; }
    this._loadFromObj(data);
  }

  private _loadFromObj(data: IOutfitRequest): void {
    const s = this._serializer;
    const state = this.state;

    const a = s.deserializeItems(data.a);
    state.available.set(a.length
      ? a.reduce((m, item) => (m[item.guid] = item, m), {} as Record<string, IItem>)
      : undefined
    );

    state.clearSelection();
    const r = s.deserializeItems(data.r);
    const y = s.deserializeItems(data.y);
    const g = s.deserializeItems(data.g);
    const b = s.deserializeItems(data.b);

    const toMap = (arr: IItem[]) => arr.reduce((m, i) => (m[i.guid] = i, m), {} as Record<string, IItem>);
    state.selectedR.set(toMap(r));
    state.selectedY.set(toMap(y));
    state.selectedG.set(toMap(g));
    state.selectedB.set(toMap(b));

    const dyes = s.deserializeDyes(data.d);
    const dyeMap: Record<string, any[]> = {};
    const dyeClasses: Record<string, (string | undefined)[]> = {};
    const allSelected = [...r, ...y, ...g, ...b];
    const seen = new Set<string>();
    const unique = allSelected.filter(i => !seen.has(i.guid) && seen.add(i.guid));
    unique.forEach((item, i) => {
      dyeMap[item.guid] = dyes[i] || [{}];
      dyeClasses[item.guid] = [];
      if (dyes[i]?.[0]?.primary) { dyeClasses[item.guid]![0] = `dye-${dyes[i][0].primary}`; }
      if (dyes[i]?.[1]?.primary) { dyeClasses[item.guid]![1] = `dye-${dyes[i][1].primary}`; }
    });
    state.dyes.set(dyeMap);
    state.dyeClasses.set(dyeClasses);
  }

  // ── Toggle item ───────────────────────────────────────────────────────────

  toggleItem(item: IItem): void {
    const state = this.state;
    state.lastLink.set(undefined);

    if (state.modifyingCloset()) {
      return this._toggleHidden(item);
    }

    const color = state.color();
    if (!color) {
      state.selectedR.update(m => { const n = { ...m }; delete n[item.guid]; return n; });
      state.selectedY.update(m => { const n = { ...m }; delete n[item.guid]; return n; });
      state.selectedG.update(m => { const n = { ...m }; delete n[item.guid]; return n; });
      state.selectedB.update(m => { const n = { ...m }; delete n[item.guid]; return n; });
    } else {
      const mapSignal = color === 'r' ? state.selectedR
        : color === 'y' ? state.selectedY
        : color === 'g' ? state.selectedG
        : state.selectedB;

      const cur = mapSignal();
      if (cur[item.guid]) {
        mapSignal.update(m => { const n = { ...m }; delete n[item.guid]; return n; });
      } else {
        mapSignal.update(m => ({ ...m, [item.guid]: item }));
      }
    }
    this._updateUrl();
  }

  private _toggleHidden(item: IItem): void {
    const state = this.state;
    if (state.shouldSync()) {
      if (!confirm('Modifying your closet will disable syncing with your tracked items. Are you sure?')) { return; }
      state.shouldSync.set(false);
      localStorage.setItem('closet.sync', '0');
    }
    state.hidden.update(h => {
      const n = { ...h };
      n[item.guid] ? delete n[item.guid] : (n[item.guid] = true);
      return n;
    });
    state.persistHidden();
  }

  // ── Dye picker ────────────────────────────────────────────────────────────

  showDyePicker(item: IItem, evt: MouseEvent): void {
    if (!item.dye) { return; }
    evt.preventDefault();
    evt.stopImmediatePropagation();
    const state = this.state;
    state.showingDyePicker.set(true);
    state.dyeItem.set(item);
    const dyeSlots = item.dye?.secondary ? 2 : 1;
    state.dyes.update(d => {
      if (!d[item.guid]) {
        const n = { ...d };
        n[item.guid] = Array.from({ length: dyeSlots }, () => ({}));
        return n;
      }
      return d;
    });
  }

  closeDyePicker(): void {
    const state = this.state;
    const item = state.dyeItem();
    if (item && !state.selectedAll()[item.guid]) {
      this.toggleItem(item);
    }
    state.showingDyePicker.set(false);
    state.dyeItem.set(undefined);
    this._updateUrl();
  }

  // ── URL / Copy ────────────────────────────────────────────────────────────

  private _updateUrl(): void {
    const state = this.state;
    const s = this._serializer;
    const sel = {
      r: state.selectedR(), y: state.selectedY(),
      g: state.selectedG(), b: state.selectedB()
    };

    const r = s.serializeItems(Object.values(sel.r));
    const y = s.serializeItems(Object.values(sel.y));
    const g = s.serializeItems(Object.values(sel.g));
    const b = s.serializeItems(Object.values(sel.b));
    const d = s.serializeDyes(sel, state.dyes());

    const url = new URL(location.href);
    url.searchParams.delete('k');
    url.searchParams.set('r', r);
    url.searchParams.set('y', y);
    url.searchParams.set('g', g);
    url.searchParams.set('b', b);
    if (d.length <= 400) { url.searchParams.set('d', d); }
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  async copyLink(): Promise<void> {
    const state = this.state;
    if (state.lastLink()) {
      navigator.clipboard.writeText(state.lastLink()!).catch(e => {
        console.error(e);
        alert('Copying link failed. Please make sure the document is focused.');
      });
      return;
    }

    state.isRendering.set(1);
    const s = this._serializer;
    const sel = {
      r: state.selectedR(), y: state.selectedY(),
      g: state.selectedG(), b: state.selectedB()
    };
    const request: IOutfitRequest = {
      r: s.serializeItems(Object.values(sel.r)),
      y: s.serializeItems(Object.values(sel.y)),
      g: s.serializeItems(Object.values(sel.g)),
      b: s.serializeItems(Object.values(sel.b)),
      d: s.serializeDyes(sel, state.dyes())
    };

    if (!this.requesting) {
      const visible = state.allItems().filter(i => !state.hidden()[i.guid]);
      request.a = s.serializeItems(visible);
    }

    const fetchPromise = async () => {
      const key = await s.saveToKV(request);
      const url = s.buildShareUrl(this.requesting, request, key || undefined);
      state.lastLink.set(url.href);
      return new Blob([url.href], { type: 'text/plain' });
    };

    try {
      const item = new ClipboardItem({ ['text/plain']: fetchPromise() });
      navigator.clipboard.write([item])
        .catch(e => { console.error(e); alert('Copying failed. Please make sure the document is focused.'); })
        .finally(() => state.isRendering.set(0));
    } catch (e) { console.error(e); state.isRendering.set(0); }
  }

  copyImage(mode: CopyImageMode): void {
    const state = this.state;
    state.showingImagePicker.set(false);
    state.isRendering.set(2);
    setTimeout(() => {
      const canvas = mode === 'square' ? this._renderer().renderSquare() : this._renderer().renderImage(mode);
      this._saveToClipboard(canvas).finally(() => state.isRendering.set(0));
    });
  }

  shareImage(mode: CopyImageMode): void {
    if (!navigator.share) { alert('Sharing is not supported by this browser.'); return; }
    const state = this.state;
    state.showingImagePicker.set(false);
    state.isRendering.set(2);
    setTimeout(() => {
      const canvas = mode === 'square' ? this._renderer().renderSquare() : this._renderer().renderImage(mode);
      this._shareCanvas(canvas).finally(() => state.isRendering.set(0));
    });
  }

  private _renderer(): ClosetRenderer {
    const state = this.state;
    const sel = {
      all: state.selectedAll(),
      r: state.selectedR(), y: state.selectedY(),
      g: state.selectedG(), b: state.selectedB()
    };
    return new ClosetRenderer({
      imageLookup: (guid) => {
        const el = this._el.nativeElement.querySelector(`.atmos-closet-item[data-guid="${guid}"] .item-icon img`) as HTMLImageElement | null;
        return el;
      },
      bgImg: this._bgImg,
      bgFilter: this.bgFilter,
      bgAttribution: this.bgAttribution,
      items: state.items(),
      itemMap: state.itemMap(),
      selected: sel,
      dyes: state.dyes(),
      svgDyes: this._svgDyes,
      imgSheets: this._imgSheets,
      iconLookup: (icon) => this._iconService.getIcon(icon) as any,
      imgNone: this._imgNone,
      imgUnknown: this._imgUnknown,
      hidden: state.hidden(),
      ongoingItems: state.ongoingItems(),
      showOngoing: state.showOngoing(),
      hideIap: state.hideIap(),
      requesting: this.requesting
    });
  }

  private async _saveToClipboard(canvas: HTMLCanvasElement): Promise<void> {
    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej('render failed')));
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    } catch (e) { console.error(e); alert('Copying failed. Please make sure the document is focused.'); }
  }

  private async _shareCanvas(canvas: HTMLCanvasElement): Promise<void> {
    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej('render failed')));
    const file = new File([blob], 'sky-outfit-request.png', { type: 'image/png' });
    const data: ShareData = { files: [file], title: 'Sky: CotL Outfit Request' };
    if (!navigator.canShare(data)) { alert('Sharing is not supported on this device.'); return; }
    try { await navigator.share(data); } catch { alert('Sharing failed.'); }
  }

  // ── Other actions ─────────────────────────────────────────────────────────

  resetSelected(): void {
    if (!confirm('This will remove the color highlights from all items. Are you sure?')) { return; }
    this.state.clearSelection();
    const url = new URL(location.href);
    ['k', 'r', 'y', 'g', 'b'].forEach(k => url.searchParams.delete(k));
    window.history.replaceState(window.history.state, '', url.pathname + url.search);
  }

  randomSelection(): void {
    if (!confirm('This will randomly select items from your closet. Are you sure?')) { return; }
    const state = this.state;
    state.clearSelection();
    const itemTypes: ItemType[] = [
      ItemType.Outfit, ItemType.Shoes, ItemType.OutfitShoes,
      ItemType.Mask, ItemType.FaceAccessory, ItemType.Necklace,
      ItemType.Hair, ItemType.HairAccessory, ItemType.HeadAccessory,
      ItemType.Cape, ItemType.Held, ItemType.Furniture, ItemType.Prop
    ];

    const newR: Record<string, IItem> = {};
    const heldProp = Math.random() < 0.4;

    for (const type of itemTypes) {
      if (type === ItemType.Held && !heldProp) { continue; }
      if (type === ItemType.Prop && heldProp) { continue; }
      if (type === ItemType.Furniture) { continue; }

      let items = state.items()[type as string] || [];
      if (!this.requesting) { items = items.filter(i => !state.hidden()[i.guid]); }
      const avail = state.available();
      if (avail) { items = items.filter(i => avail[i.guid]); }
      if (state.hideIap()) { items = items.filter(i => !i.iaps?.length); }

      const item = items[Math.floor(Math.random() * items.length)];
      if (item) { newR[item.guid] = item; }
    }

    state.selectedR.set(newR);
    this._updateUrl();
  }

  calculateCost(): void {
    const items = Object.values(this.state.selectedAll());
    if (!items.length) { alert('There are no items selected.'); return; }
    let ids = this._serializer.serializeItems(items).substring(0, 1800);
    const url = new URL(`${location.origin}/item/unlock-calculator`);
    url.searchParams.set('items', ids);
    window.open(url.href, '_blank');
  }

  scrollToWarning(): void {
    const el = this._el.nativeElement.querySelector('.atmos-warn-hidden');
    if (el) { el.scrollIntoView(); }
  }

  toggleImagePicker(): void {
    this.state.showingImagePicker.update(v => !v);
  }
}
