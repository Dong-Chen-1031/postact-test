import type { VirtualElement } from "./element";

export function transcribe(
  items: (VirtualElement | string)[],
): DocumentFragment {
  const fragment = window.document.createDocumentFragment();

  for (const item of items) {
    if (typeof item == "string") {
      fragment.appendChild(window.document.createTextNode(item));
      continue;
    }

    const element = window.document.createElement(item.tag);
    if (item.children) {
      const transcription = transcribe(item.children);
      element.appendChild(transcription);
    }
    if (item.listeners) {
      Object.entries(item.listeners).forEach(([type, fn]) => {
        element.addEventListener(type, fn);
      });
    }
    if (item.attributes) {
      Object.entries(item.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    fragment.appendChild(element);
  }

  return fragment;
}
