import type { PostactElement } from "./element";
import { transcribe } from "./transcribe";

/**
 * Selects one element in the document with a query.
 *
 * Instead of returning `T | null`, this function throws an error
 * if nothing's found.
 *
 * @param {string} query Hello, World!
 * @returns {PostactElement<T>} Element control with Postact as the backend.
 * @throws {ReferenceError} The element was not found.
 */
export function select<T extends HTMLElement = HTMLElement>(
  query: string,
): PostactElement<T> {
  const result = window.document.querySelector(query);
  if (!result)
    throw new ReferenceError(`Could not find element with query: ${query}`);

  return {
    inner: result as T,
    subscribe(type, fn) {
      this.inner.addEventListener(type, fn);
    },
    render(ele) {
      if (typeof ele == "string") {
        return this.inner.replaceChildren(window.document.createTextNode(ele));
      }

      if (typeof ele == "object") {
        if ("tag" in ele) {
          return this.inner.replaceChildren(transcribe([ele]));
        } else {
          return this.inner.replaceChildren(transcribe(ele));
        }
      }

      throw new Error("unreachable");
    },
  };
}
