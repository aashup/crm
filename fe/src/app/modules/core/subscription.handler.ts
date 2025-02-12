import { Subscription } from 'rxjs';

export class SubscriptionHandler {
    private subscriptions: Subscription[] = [];
    private subjects: any[] = [];

    set subscribe(subscription: Subscription) {
        this.subscriptions.push(subscription);
    }

    set subject(ref: any) {
        this.subjects.push(ref);
    }

    add(subscription: Subscription) {
        this.subscriptions.push(subscription);
    }

    unsubscribe() {
        this.subscriptions.forEach(el => {
            try {
                el.unsubscribe()
            } catch (error) { }
        });
        this.subjects.forEach(el => {
            try {
                el.complete()
            } catch (error) { }
        });
    }

}
