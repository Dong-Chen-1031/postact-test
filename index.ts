import { select, html, type VirtualItem, state, dependent, css } from "./src";

function createApp(): VirtualItem {
  const $count = state(0);

  return html`<div>
      hello, world! my name is walter hartwell white ${$count}
    </div>
    <button onclick=${() => $count.update((v) => v + 1)}>add</button>`;
}

select("#app").render(createApp());
