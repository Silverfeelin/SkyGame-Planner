import { Directive, HostListener, Input } from '@angular/core';
import { IItem } from '../interfaces/item.interface';
import { DataService } from '../services/data.service';

@Directive({
  selector: '[appCall]'
})
export class CallDirective {
  @Input() item?: IItem;

  @HostListener('click', ['$event'])
  click(event: MouseEvent) {
    this.playCall();
  }

  constructor(
    private readonly _dataService: DataService
  ) { }

  playCall(): void {
    if (!this.item) { return; }
    const basePath = 'assets/game/sounds/call/';
    const sounds = this._dataService.callConfig.items.find(call => call.name === this.item!.name)?.sounds;
    if (!sounds) { return; }
    const rnd = sounds[Math.floor(Math.random() * sounds.length)];
    var audio = new Audio(basePath + rnd);
    audio.play();
  }
}
