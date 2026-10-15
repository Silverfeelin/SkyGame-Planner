import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, OnDestroy, output, signal, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { IRealm, ISpirit } from 'skygame-data';
import { TooltipDirective } from '@app/directives/tooltip.directive';

const KEYFRAMES = [0, 10, 22, 34, 45, 55] as const;
const FRAME_COUNT = (KEYFRAMES.at(-1) ?? 0) + 1;
const FRAME_DURATION_MS = 45;
// Long jumps skip frames so the whole transition never exceeds this.
const MAX_TRANSITION_MS = 1000;

/**
 * Realm-constellation viewer.
 */
@Component({
  selector: 'app-realm-constellation',
  templateUrl: './realm-constellation.component.html',
  styleUrl: './realm-constellation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipDirective, MatIcon]
})
export class RealmConstellationComponent implements AfterViewInit, OnDestroy {
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
  private _rafId?: number;
  private _tweenFrom = 0;
  private _tweenStart = 0;
  private _tweenDuration = 0;
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
    if (this._rafId !== undefined) {
      cancelAnimationFrame(this._rafId);
      this._rafId = undefined;
    }
  }

  onSpiritClick(spirit: ISpirit | undefined): void {
    if (spirit) { this.spiritClicked.emit(spirit); }
  }

  jumpTo(index: number): void {
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
    if (RealmConstellationComponent._framesLoaded) { return Promise.resolve(); }
    if (RealmConstellationComponent._loadPromise) { return RealmConstellationComponent._loadPromise; }

    const frames: HTMLImageElement[] = [];
    RealmConstellationComponent._frames = frames;
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
    RealmConstellationComponent._loadPromise = Promise.all(promises).then(() => {
      RealmConstellationComponent._framesLoaded = true;
    });
    return RealmConstellationComponent._loadPromise;
  }

  private renderFrame(index: number): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const frames = RealmConstellationComponent._frames;
    if (!ctx || !frames) { return; }
    const img = frames[index];
    if (!img) { return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
  }

  /** Starts a tween from the current frame, retargeting any tween already in progress. */
  private scheduleAnimation(): void {
    if (!RealmConstellationComponent._framesLoaded) { return; }
    const distance = Math.abs(this._targetKeyframe - this._keyframe);
    if (!distance && this._rafId === undefined) { return; }

    this._tweenFrom = this._keyframe;
    this._tweenStart = performance.now();
    this._tweenDuration = Math.min(distance * FRAME_DURATION_MS, MAX_TRANSITION_MS);
    this.swapping.set(true);
    this._rafId ??= requestAnimationFrame(t => this.tick(t));
  }

  private tick(time: number): void {
    this._rafId = undefined;
    if (this._disposed) { return; }

    // The rAF timestamp can predate the tween start by up to a frame.
    const elapsed = Math.max(0, time - this._tweenStart);
    const progress = this._tweenDuration ? Math.min(1, elapsed / this._tweenDuration) : 1;
    const eased = 1 - Math.pow(1 - progress, 3);
    const frame = Math.round(this._tweenFrom + (this._targetKeyframe - this._tweenFrom) * eased);
    if (frame !== this._keyframe) {
      this._keyframe = Math.max(0, Math.min(frame, FRAME_COUNT - 1));
      this.renderFrame(this._keyframe);
    }

    if (progress < 1) {
      this._rafId = requestAnimationFrame(t => this.tick(t));
      return;
    }
    this.swapping.set(false);
  }
}
