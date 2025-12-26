import type {
  VirtualElement,
  VirtualFragment,
  VirtualItem,
  VirtualTextNode,
} from "./structure";

import { ensureWindow } from "../utilities";
import { transformArgToVirtualItem } from "../html";

function isPrimitive(value: any): boolean {
  return ["string", "number", "bigint", "boolean"].includes(typeof value);
}

function _toFrag(vi: VirtualItem): DocumentFragment {
  const fragment = window.document.createDocumentFragment();
  if (vi === null || typeof vi === "undefined") return fragment;

  if (typeof vi === "string") {
    fragment.appendChild(window.document.createTextNode(vi));
    return fragment;
  }

  // a text node
  if (Object.hasOwn(vi, "__postactItem")) {
    if (vi["__postactItem"] == "virtual-text-node") {
      // VirtualTextNode
      const vtn = vi as VirtualTextNode;
      let tn = window.document.createTextNode(vtn.data);

      if (vtn.subscribable)
        vtn.subscribable.subscribe((value) => {
          const frag = _toFrag(transformArgToVirtualItem(value));
            )
          tn.parentElement?.replaceChild(frag, tn);
          tn = frag
        });

      fragment.appendChild(tn);
      return fragment;
    } else if (vi["__postactItem"] == "virtual-element") {
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
        vi.subscribable.subscribe(function sub(value: any) {
          if (isPrimitive(value)) {
            // then we'll keep it simple
            element.textContent = value.toString();
          } else if (value === null) {
            element.textContent = "";
          } else {
            // vi.subscribable!.unsubscribe(sub);
            element.replaceChildren(_toFrag(transformArgToVirtualItem(value)));
          }
        });

      // inner children
      element.append(...vi.children.map((child) => _toFrag(child)));

      fragment.appendChild(element);
      return fragment;
    }
  }

  // we're left with VirtualFragment
  if (vi.subscribable)
    vi.subscribable.subscribe(function sub(value: any) {
      if (isPrimitive(value)) {
        fragment.textContent = value.toString();
      } else if (value === null) {
        fragment.textContent = "";
      } else {
        const newFrag = (value as VirtualFragment).children.reduce((f, vi) => {
          f.append(_toFrag(transformArgToVirtualItem(vi)));
          return f;
        }, window.document.createDocumentFragment());
        fragment.parentElement?.replaceChildren(newFrag);
      }
    });

  fragment.append(...(vi as VirtualFragment).children.map((vi) => _toFrag(vi)));
  return fragment;
}

/**
 * Converts a virtual DOM to a document fragment for rendering it on the web.
 * @param vi
 */
export function virtualItemsToFragment(vi: VirtualItem): DocumentFragment {
  ensureWindow();
  return _toFrag(vi);
}
