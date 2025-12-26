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

import { PostactIdentifier } from "../_internals";

function _toFrag(vi: VirtualItem): DocumentFragment {
  const fragment = window.document.createDocumentFragment();
  if (vi === null || typeof vi === "undefined") return fragment;

  if (typeof vi === "string") {
    fragment.appendChild(window.document.createTextNode(vi));
    return fragment;
  }

  // a text node

  if (isVtn(vi)) {
    // VirtualTextNode
    const vtn = vi as VirtualTextNode;
    const tn = window.document.createTextNode(vtn.data);
    fragment.appendChild(tn);
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

    // inner children
    element.append(...vi.children.map((child) => _toFrag(child)));

    fragment.appendChild(element);
    return fragment;
  }

  if (isVf(vi)) {
    // we're left with VirtualFragment

    fragment.append(
      ...(vi as VirtualFragment).children.map((vi) => {
        return _toFrag(vi);
      }),
    );
    return fragment;
  } else {
    throw new Error("unknown virtual item", vi);
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
