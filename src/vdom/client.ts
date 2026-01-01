import {
  isVe,
  isVf,
  isVtn,
  type VirtualFragment,
  type VirtualItem,
  type VirtualTextNode,
} from "./structure";

import { ensureWindow, isPrimitive } from "../utilities";
import { transformArgToVirtualItem } from "../html";

import { Maybe, PostactIdentifier, simpleRandString } from "../_internals";

function _toFrag(vi: VirtualItem): DocumentFragment {
  const fragment = window.document.createDocumentFragment();
  if (vi === null || typeof vi === "undefined") return fragment;

  if (typeof vi === "string") {
    fragment.appendChild(window.document.createTextNode(vi));
    return fragment;
  }

  if (isVtn(vi)) {
    // text node (VirtualTextNode)
    const vtn = vi as VirtualTextNode;

    // i need to make sure this is a constant
    // so that the pointer doesn't change essentially
    const id = simpleRandString();
    const start = window.document.createComment(`${id}`);
    const tn = window.document.createTextNode(vtn.data);
    const end = window.document.createComment(`/${id}`);
    const fs = new FragmentSpread(start, end, fragment); // as of now, the parent is the container

    if (vtn.subscribable) {
      vtn.subscribable.subscribe((value) => {
        if (tn.parentNode) {
          // if the text node has been added to the DOM, parentNode would be present
          fs.setParent(tn.parentNode);
        }
        const newFrag = resolveSubscribableValueToFrag(value);
        fs.spreadAndReplace(newFrag);
      });
    }

    fragment.append(start, tn, end);
    return fragment;
  }

  if (isVe(vi)) {
    // VirtualElement
    const element = window.document.createElement(vi.tag);

    // attributes
    Object.entries(vi.attributes).forEach(([name, value]) =>
      element.setAttribute(name, value),
    );

    // listeners
    vi.listeners.forEach(([name, listener]) =>
      element.addEventListener(name, listener),
    );

    // subscribables
    if (vi.subscribable)
      vi.subscribable.subscribe((value) => {
        const newFrag = resolveSubscribableValueToFrag(value);
        element.replaceChildren(newFrag);
      });

    // inner children
    element.append(...vi.children.map((child) => _toFrag(child)));

    fragment.appendChild(element);
    return fragment;
  }

  if (isVf(vi)) {
    // we're left with VirtualFragment

    const id = simpleRandString();
    const start = window.document.createComment(`${id}`);
    const end = window.document.createComment(`/${id}`);
    const fs = new FragmentSpread(start, end, fragment);

    const toInsert = vi.children.reduce((frag, vi) => {
      frag.append(_toFrag(vi));
      return frag;
    }, window.document.createDocumentFragment());

    if (vi.subscribable)
      vi.subscribable.subscribe((value) => {
        if (start.parentNode) {
          fs.setParent(start.parentNode);
        }

        const newFrag = resolveSubscribableValueToFrag(value);
        fs.spreadAndReplace(newFrag);
      });

    fragment.append(start, toInsert, end);
    return fragment;
  } else {
    throw new Error("unknown virtual item", vi);
  }
}

function resolveSubscribableValueToFrag(value: any): DocumentFragment {
  if (typeof value === "undefined" || value === null) {
    return window.document.createDocumentFragment();
  } else if (isPrimitive(value)) {
    const frag = window.document.createDocumentFragment();
    frag.appendChild(window.document.createTextNode(value.toString()));
    return frag;
  } else {
    return _toFrag(value);
  }
}

class FragmentSpread {
  #start: Node;
  #end: Node;
  #parent: Node;

  constructor(start: Node, end: Node, parent: Node) {
    this.#start = start;
    this.#end = end;
    this.#parent = parent;
  }

  setParent(parent: Node) {
    this.#parent = parent;
  }

  spreadAndReplace(items: DocumentFragment) {
    let current = this.#start.nextSibling;

    while (current && !this.#end.isEqualNode(current)) {
      const next = current.nextSibling; // cache first
      this.#parent.removeChild(current);
      current = next;
    }

    this.#parent.insertBefore(items, this.#end);
  }
}

/**
 * Converts a virtual DOM to a document fragment for rendering it on the web.
 * @param vi
 */
export function virtualItemsToFragment(vi: VirtualItem): DocumentFragment {
  ensureWindow();
  return _toFrag(vi);
}
