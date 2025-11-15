export interface VirtualElement {
  tag: string;
  children?: (VirtualElement | string)[];
  attributes?: Record<string, string>;
  listeners?: Record<string, any>;
}

export interface PostactElement<T extends HTMLElement> {
  readonly inner: T;
  readonly subscribe: <K extends keyof HTMLElementEventMap>(
    type: K,
    fn: (event: HTMLElementEventMap[K]) => any,
  ) => void;
  readonly render: (
    ele: VirtualElement | string | (VirtualElement | string)[],
  ) => void;
}
