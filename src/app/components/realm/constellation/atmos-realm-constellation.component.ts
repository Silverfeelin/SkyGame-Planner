import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, OnDestroy, output, signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IRealm, ISpirit } from 'skygame-data';

const KEYFRAMES = [0, 10, 22, 34, 45, 55] as const;
const FRAME_COUNT = (KEYFRAMES.at(-1) ?? 0) + 1;
const FRAME_INTERVAL_MS = 20;

/**
 * Atmospheric realm-constellation viewer. Mirrors `RealmConstellationComponent`
 * inputs/outputs and ports the legacy canvas keyframe tween between realms.
 */
@Component({
  selector: 'app-atmos-realm-constellation',
  templateUrl: './atmos-realm-constellation.component.html',
  styleUrl: './atmos-realm-constellation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon]
})
export class AtmosRealmConstellationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly realm = input.required<IRealm>();
  readonly completed = input<boolean>(false);
  readonly realms = input<ReadonlyArray<IRealm>>([]);

  readonly spiritClicked = output<ISpirit>();
  readonly realmChanged = output<IRealm>();

  readonly icons = computed(() => this.realm().constellation?.icons ?? []);

  readonly constellationRealms = computed<ReadonlyArray<IRealm>>(() =>
    this.realms().filter(r => r.constellation)
  );

  readonly realmIndex = computed<number>(() => {
    const list = this.constellationRealms();
    if (!list.length) { return 0; }
    return Math.max(0, list.findIndex(r => r.guid === this.realm().guid));
  });

  readonly maxRealmIndex = computed<number>(() => Math.max(0, this.constellationRealms().length - 1));

  /** True while a keyframe tween is in progress (used to fade icons). */
  readonly swapping = signal<boolean>(false);

  private static _frames?: ReadonlyArray<HTMLImageElement>;
  private static _framesLoaded = false;
  private static _loadPromise?: Promise<void>;

  private _keyframe = 0;
  private _targetKeyframe = 0;
  private _intervalId?: number;
  private _viewReady = false;
  private _disposed = false;

  constructor() {
    effect(() => {
      const target = KEYFRAMES[this.realmIndex()] ?? 0;
      this._targetKeyframe = target;
      if (!this._viewReady) { return; }
      this.scheduleAnimation();
    });
  }

  ngAfterViewInit(): void {
    this._viewReady = true;
    this._keyframe = KEYFRAMES[this.realmIndex()] ?? 0;
    this.ensureFramesLoaded().then(() => {
      if (this._disposed) { return; }
      this.renderFrame(this._keyframe);
      if (this._keyframe !== this._targetKeyframe) { this.scheduleAnimation(); }
    });
  }

  ngOnDestroy(): void {
    this._disposed = true;
    if (this._intervalId !== undefined) {
      window.clearInterval(this._intervalId);
      this._intervalId = undefined;
    }
  }

  onSpiritClick(spirit: ISpirit | undefined): void {
    if (spirit) { this.spiritClicked.emit(spirit); }
  }

  jumpTo(index: number): void {
    if (this.swapping()) { return; }
    const list = this.constellationRealms();
    if (!list.length) { return; }
    const next = list[Math.max(0, Math.min(index, list.length - 1))];
    if (next && next.guid !== this.realm().guid) {
      this.realmChanged.emit(next);
    }
  }

  scroll(delta: number): void {
    this.jumpTo(this.realmIndex() + delta);
  }

  private ensureFramesLoaded(): Promise<void> {
    if (AtmosRealmConstellationComponent._framesLoaded) { return Promise.resolve(); }
    if (AtmosRealmConstellationComponent._loadPromise) { return AtmosRealmConstellationComponent._loadPromise; }

    const frames: HTMLImageElement[] = [];
    AtmosRealmConstellationComponent._frames = frames;
    const promises: Promise<void>[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      frames.push(img);
      promises.push(new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = err => reject(err);
      }));
      img.src = `/assets/game/constellations/anim/${i}.webp`;
    }
    AtmosRealmConstellationComponent._loadPromise = Promise.all(promises).then(() => {
      AtmosRealmConstellationComponent._framesLoaded = true;
    });
    return AtmosRealmConstellationComponent._loadPromise;
  }

  private renderFrame(index: number): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const frames = AtmosRealmConstellationComponent._frames;
    if (!ctx || !frames) { return; }
    const img = frames[index];
    if (!img) { return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  }

  private scheduleAnimation(): void {
    if (this._intervalId !== undefined) { return; }
    if (!AtmosRealmConstellationComponent._framesLoaded) { return; }
    if (this._keyframe === this._targetKeyframe) { return; }
    this.swapping.set(true);
    this._intervalId = window.setInterval(() => this.tick(), FRAME_INTERVAL_MS);
  }

  private tick(): void {
    if (this._disposed) { return; }
    if (this._keyframe !== this._targetKeyframe) {
      this._keyframe += this._keyframe < this._targetKeyframe ? 1 : -1;
      this._keyframe = Math.max(0, Math.min(this._keyframe, FRAME_COUNT - 1));
    }
    this.renderFrame(this._keyframe);
    if (this._keyframe === this._targetKeyframe) {
      if (this._intervalId !== undefined) {
        window.clearInterval(this._intervalId);
        this._intervalId = undefined;
      }
      // Brief debounce before re-enabling icon clicks, mirroring legacy.
      window.setTimeout(() => { if (!this._disposed) { this.swapping.set(false); } }, 1);
    }
  }
}
