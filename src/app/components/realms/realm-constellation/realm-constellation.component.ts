import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IRealm } from 'src/app/interfaces/realm.interface';
import { ISpirit } from 'src/app/interfaces/spirit.interface';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-realm-constellation',
  templateUrl: './realm-constellation.component.html',
  styleUrls: ['./realm-constellation.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealmConstellationComponent implements OnInit, OnChanges {
  @Input() realm!: IRealm;
  @Input() completed = false;

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  @Output() readonly spiritClicked = new EventEmitter<ISpirit>();
  @Output() readonly realmChanged = new EventEmitter<IRealm>();

  static frames: Array<HTMLImageElement>;
  static framesLoaded = false;

  realms: Array<IRealm>;
  keyframes = [0, 10, 22, 34, 45, 55];
  keyframe = 0;
  targetKeyframe = 0;
  realmIndex = 0;
  maxRealmIndex = 5;
  interval?: number;
  swapping = false;
  disposing = false;

  constructor(
    private readonly _dataService: DataService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _route: ActivatedRoute
  ) {
    this.realms = this._dataService.realmConfig.items.filter(r => r.constellation);
  }

  ngOnInit(): void {
    this.realmIndex = this.realms.findIndex(r => r.guid === this.realm.guid);
    this.keyframe = this.keyframes[this.realmIndex];
    this.initializeFrames();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['realm']) {
      this.realmIndex = this.realms.findIndex(r => r.guid === this.realm.guid);
      this.animateToRealm();
    }
  }

  gotoSpirit(spirit: ISpirit): void {
    this.spiritClicked.emit(spirit);
  }

  jumpConstellation(i: number): void {
    if (this.swapping) { return; }
    this.realmIndex = i;
    this.animateToRealm();

    this.realmChanged.emit(this.realms[this.realmIndex]);
  }

  scrollConstellation(lr: number): void {
    if (this.swapping) { return; }
    this.realmIndex = Math.max(0, Math.min(this.realmIndex + lr, this.maxRealmIndex));
    this.animateToRealm();

    this.realmChanged.emit(this.realms[this.realmIndex]);
  }

  private initializeFrames(): void {
    // Frames are already loaded. Render the current constellation.
    if (RealmConstellationComponent.framesLoaded) {
      setTimeout(() => this.renderCurrentFrame());
      return;
    }

    // Frame are being loaded.
    if (RealmConstellationComponent.frames) { return; }

    const frames: Array<HTMLImageElement> = [];
    RealmConstellationComponent.frames = frames;
    const promises: Array<Promise<void>> = [];

    // Load all frames
    for (let i = 0; i <= 55; i++) {
      const file = `/assets/game/constellations/anim/${i}.webp`;

      const img = new Image();
      frames.push(img);

      const promise = new Promise<void>((resolve, reject) => {
        img.onload = () => { resolve();};
        img.onerror = (error) => { reject(error); };
      });

      img.src = file;
      promises.push(promise);
    }

    // When all frames have loaded, render the current frame.
    Promise.all(promises).then(() => {
      RealmConstellationComponent.framesLoaded = true;
      this.renderCurrentFrame();
    });
  }

  private renderCurrentFrame(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) { return; }
    const w = this.canvas.nativeElement.width;
    const h = this.canvas.nativeElement.height;
    ctx.clearRect(0, 0, w, h);

    const img = RealmConstellationComponent.frames[this.keyframe];
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
    this._changeDetectorRef.markForCheck();
  }

  private animateToRealm(): void {
    if (this.swapping) { return; }
    this.targetKeyframe = this.keyframes[this.realmIndex];

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) { return; }

    // Prevent double animation loop.
    if (this.interval) { return; }
    // Already at target.
    if (this.keyframe === this.targetKeyframe) { return; }

    // Start animating.
    this.interval = window.setInterval(() => {
      // Move keyframe 1 towards target.
      if (this.keyframe !== this.targetKeyframe) {
        this.keyframe += this.keyframe < this.targetKeyframe ? 1 :  -1;
        this.keyframe = Math.max(0, Math.min(this.keyframe, this.keyframes.at(-1)!));
      }

      // Render frame
      const w = this.canvas.nativeElement.width;
      const h = this.canvas.nativeElement.height;
      const img = RealmConstellationComponent.frames[this.keyframe];
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);

      // Stop animation.
      if (this.keyframe === this.targetKeyframe) {
        this.doneAnimating();
      }

      this._changeDetectorRef.markForCheck();
    }, 20);
  }

  private doneAnimating(): void {
    window.clearInterval(this.interval);
    this.interval = undefined;
    this.swapping = true;
    setTimeout(() => {
      this.swapping = false;
      this._changeDetectorRef.markForCheck();
    }, 1);
  }
}
