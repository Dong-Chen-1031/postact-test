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

/**
 * Identifier for Postact internal objects.
 * To get the identifier, get the `__p` field value.
 */
export enum PostactIdentifier {
  Dependent = 0,
  State = 1,

  VirtualElement = 2,
  VirtualFragment = 3,
  VirtualTextNode = 4,
}

/**
 * Check if `item` has a postact identifier of `ident`.
 * @param ident The Postact identifier to check.
 * @param item The item to check.
 */
export function isPostact<K extends PostactIdentifier>(
  ident: K,
  item: any,
): item is K {
  if (item === null) return false;
  if (
    typeof item === "object" &&
    Object.hasOwn(item, "__p") &&
    item["__p"] == ident
  )
    return true;
  return false;
}
