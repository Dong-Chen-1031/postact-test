export type Subscriber<T> = (value: T) => any;

export interface Subscribable<T> {
  /**
   * Current state value.
   * You may replace it using the `=` (assign) operator, as it's not read-only, yet
   * no subscribers will be notified nor will checks be made, which is the same behavior `State.set()` does.
   */
  value: T;

  /**
   * Subscribe to state value changes.
   * @param subscriber The subscriber, taking the current state value as the parameter.
   */
  readonly subscribe: (subscriber: Subscriber<T>) => void;
}

export class BaseSubscribable<T> implements Subscribable<T> {
  value: T;
  #subscribers: Subscriber<T>[];

  constructor(initial: T) {
    this.value = initial;
    this.#subscribers = [];
  }

  subscribe(subscriber: Subscriber<T>) {
    this.#subscribers.push(subscriber);
  }

  emit() {
    const value = this.value; // cache
    this.#subscribers.forEach((sub) => sub(value));
  }
}
