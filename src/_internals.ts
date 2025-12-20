// will keep it here

export class Maybe<T> {
  #hasValue: boolean;
  #value: T | null;

  constructor(hasValue: boolean, value: T | null = null) {
    this.#hasValue = hasValue;
    this.#value = value;
  }

  unwrap(): T {
    if (!this.#hasValue)
      throw new Error("cannot call unwrap() on Maybe.none()");

    return this.#value as T;
  }

  isNone(): boolean {
    return !this.#hasValue;
  }

  replace(value: T) {
    this.#hasValue = true;
    this.#value = value;
  }

  static none<T>(): Maybe<T> {
    return new Maybe(false);
  }

  static some<T>(value: T): Maybe<T> {
    return new Maybe(true, value);
  }
}
