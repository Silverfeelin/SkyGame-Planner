import { SubscriptionLike } from 'rxjs';

export class SubscriptionBag {
  subscriptions: Array<SubscriptionLike> = [];

  push(...subscriptions: Array<SubscriptionLike>) {
    subscriptions.forEach(s => this.subscriptions.push(s));
  }

  unsubscribe() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
