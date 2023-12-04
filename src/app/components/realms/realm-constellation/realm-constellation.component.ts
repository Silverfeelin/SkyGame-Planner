import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
export class RealmConstellationComponent implements OnInit {
  @Input() realm!: IRealm;

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

  direction: number = 1;
  interval?: number;
  swapping = false;

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

  private initializeFrames(): void {
    if (RealmConstellationComponent.framesLoaded) {
      setTimeout(() => this.renderCurrentFrame());
      return;
    }
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


    Promise.all(promises).then(() => {
      RealmConstellationComponent.framesLoaded = true;
      this.renderCurrentFrame();
    });
  }

  gotoSpirit(spirit: ISpirit): void {
    this.spiritClicked.emit(spirit);
  }

  scrollTo(lr: number): void {
    if (this.swapping) { return; }
    this.animateTo(lr);
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

  private animateTo(lr: number): void {
    if (this.swapping) { return; }
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) { return; }

    this.realmIndex = Math.max(0, Math.min(this.realmIndex + lr, this.maxRealmIndex));

    this.direction = lr;
    this.targetKeyframe = this.keyframes[this.realmIndex];

    // Prevent double animation loop.
    if (this.interval) { return; }

    if (this.keyframe === this.targetKeyframe) { return; }
    this.interval = window.setInterval(() => {
      const w = this.canvas.nativeElement.width;
      const h = this.canvas.nativeElement.height;

      this.keyframe += this.direction;
      const img = RealmConstellationComponent.frames[this.keyframe];
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
      if (this.keyframe === this.targetKeyframe) {
        this.doneAnimating();
      }
      this._changeDetectorRef.markForCheck();
    }, 30);
  }

  private doneAnimating(): void {
    window.clearInterval(this.interval);
    this.interval = undefined;
    this.swapping = true;
    this.realmChanged.emit(this.realms[this.realmIndex]);
    setTimeout(() => {
      this.swapping = false;
      this._changeDetectorRef.markForCheck();
    }, 1);
  }
}
