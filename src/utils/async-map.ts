import { Observable } from 'rxjs';
export function appAsyncMap(map) {
  return observable =>
    new Observable(observer => {
      // this function will called each time this
      // Observable is subscribed to.

      const subscription = observable.subscribe({
        next(value) {
          map(value).then(newValue => {
            observer.next(newValue);
          });
        },
        error(err) {
          observer.error(err);
        },
        complete() {
          observer.complete();
        },
      });
      // the return value is the teardown function,
      // which will be invoked when the new
      // Observable is unsubscribed from.
      return () => {
        subscription.unsubscribe();
      };
    });
}
