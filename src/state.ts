export type StateUpdateDispatch<T> = (prev: T) => T;
export type StateUpdate<T> = T | StateUpdateDispatch<T>;

export interface State<T> {
  value: T;
  readonly update: (update: StateUpdate<T>) => any;
}

function isUpdater<T>(
  a: T | StateUpdateDispatch<T>,
): a is StateUpdateDispatch<T> {
  return typeof a == "function";
}

export function state<T>(defaultValue: T): State<T> {
  return {
    value: defaultValue,
    update(item) {
      if (isUpdater(item)) {
        this.value = item(this.value);
      } else {
        this.value = item;
      }
    },
  };
}
