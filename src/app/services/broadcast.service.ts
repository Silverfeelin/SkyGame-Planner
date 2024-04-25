import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export interface IBroadcastMessage<T> {
  type: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class BroadcastService implements OnDestroy {
  private channel = new BroadcastChannel('sky-planner');
  subject = new Subject<IBroadcastMessage<unknown>>();

  constructor() {
    this.channel.onmessage = (message) => {
      this.onMessage(message.data);
    }
  }

  broadcast<T>(message: IBroadcastMessage<T>, includeSelf = false) {
    this.channel.postMessage(message);
    if (includeSelf) {
      this.onMessage(message);
    }
  }

  onMessage(message: IBroadcastMessage<unknown>): void {
    this.subject.next(message);
  }

  ngOnDestroy(): void {
    this.subject.complete();
    this.channel.close();
  }
}
