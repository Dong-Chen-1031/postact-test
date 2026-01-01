import { select, html, type VirtualItem, state, dependent, css } from "./src";

function createApp(): VirtualItem {
  const $count = state(0);
  const $label = dependent($count, (count) => {
    return count > 1
      ? count > 4
        ? html`<h1>boo!</h1>`
        : "lil goofy ahh"
      : html`<h1>hmm</h1>`;
  });

  return html`<div>
    <h1 style=${css({ color: "red" })}>Hello, World!</h1>
    <button onclick=${() => $count.update((v) => v + 1)}>${$label}</button>
  </div>`;
}

select("#app").render(createApp());
